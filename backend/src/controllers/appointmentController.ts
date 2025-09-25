import { Request, Response } from 'express'
import { DatabaseService } from '@/services/database'
import { logger } from '@/utils/logger'
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  ForbiddenError,
  ConflictError,
  asyncHandler 
} from '@/middleware/errorHandler'
import { 
  validateUUID, 
  validateAppointment,
  validateAndSanitizeInput 
} from '@/utils/validation'

/**
 * Get appointments
 */
export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status, doctorId, patientId, startDate, endDate } = req.query
  const user = req.user!

  const prisma = DatabaseService.getInstance()
  const pageNum = parseInt(page as string, 10)
  const limitNum = Math.min(parseInt(limit as string, 10), 100)
  const offset = (pageNum - 1) * limitNum

  // Build where conditions based on user role
  const whereConditions: any = {}

  // Role-based filtering
  if (user.role === 'PATIENT') {
    // Patients can only see their own appointments
    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId }
    })
    if (!patient) {
      throw new NotFoundError('Patient profile')
    }
    whereConditions.patientId = patient.id
  } else if (user.role === 'DOCTOR') {
    // Doctors can see their own appointments
    whereConditions.doctorId = user.userId
  }

  // Additional filters
  if (status) {
    whereConditions.status = status
  }
  if (doctorId && user.role !== 'PATIENT') {
    whereConditions.doctorId = doctorId
  }
  if (patientId && user.role !== 'PATIENT') {
    whereConditions.patientId = patientId
  }
  if (startDate || endDate) {
    whereConditions.scheduledTime = {}
    if (startDate) whereConditions.scheduledTime.gte = new Date(startDate as string)
    if (endDate) whereConditions.scheduledTime.lte = new Date(endDate as string)
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where: whereConditions,
      include: {
        patient: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        },
        doctor: {
          include: { profile: true }
        }
      },
      orderBy: { scheduledTime: 'asc' },
      skip: offset,
      take: limitNum,
    }),
    prisma.appointment.count({ where: whereConditions })
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.json({
    data: appointments,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    }
  })
})

/**
 * Get appointment by ID
 */
export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid appointment ID format')
  }

  const prisma = DatabaseService.getInstance()

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: {
        include: {
          user: {
            include: { profile: true }
          }
        }
      },
      doctor: {
        include: { profile: true }
      }
    }
  })

  if (!appointment) {
    throw new NotFoundError('Appointment')
  }

  // Check access permissions
  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId }
    })
    if (!patient || appointment.patientId !== patient.id) {
      throw new ForbiddenError('You can only access your own appointments')
    }
  } else if (user.role === 'DOCTOR' && appointment.doctorId !== user.userId) {
    throw new ForbiddenError('You can only access your own appointments')
  }

  res.json({ appointment })
})

/**
 * Create appointment
 */
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!
  const appointmentData = req.body

  // Validate appointment data
  const validation = validateAppointment(appointmentData)
  if (!validation.isValid) {
    throw new ValidationError('Invalid appointment data', { errors: validation.errors })
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: appointmentData.patientId }
  })
  if (!patient) {
    throw new NotFoundError('Patient')
  }

  // Verify doctor exists
  const doctor = await prisma.user.findUnique({
    where: { 
      id: appointmentData.doctorId,
      role: 'DOCTOR'
    }
  })
  if (!doctor) {
    throw new NotFoundError('Doctor')
  }

  // Check if patient can only book their own appointments
  if (user.role === 'PATIENT') {
    const userPatient = await prisma.patient.findUnique({
      where: { userId: user.userId }
    })
    if (!userPatient || userPatient.id !== appointmentData.patientId) {
      throw new ForbiddenError('You can only book appointments for yourself')
    }
  }

  // Check for scheduling conflicts
  const scheduledTime = new Date(appointmentData.scheduledTime)
  const duration = appointmentData.duration || 30 // Default 30 minutes
  const endTime = new Date(scheduledTime.getTime() + duration * 60000)

  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: appointmentData.doctorId,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      OR: [
        {
          AND: [
            { scheduledTime: { lte: scheduledTime } },
            { scheduledTime: { gte: new Date(scheduledTime.getTime() - 30 * 60000) } }
          ]
        },
        {
          AND: [
            { scheduledTime: { gte: scheduledTime } },
            { scheduledTime: { lt: endTime } }
          ]
        }
      ]
    }
  })

  if (conflictingAppointment) {
    throw new ConflictError('Doctor is not available at the requested time')
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      scheduledTime,
      duration,
      type: validateAndSanitizeInput(appointmentData.type, 'string'),
      reason: appointmentData.reason ? validateAndSanitizeInput(appointmentData.reason, 'string') : null,
      notes: appointmentData.notes ? validateAndSanitizeInput(appointmentData.notes, 'string') : null,
      status: 'SCHEDULED',
      createdBy: user.userId,
    },
    include: {
      patient: {
        include: {
          user: {
            include: { profile: true }
          }
        }
      },
      doctor: {
        include: { profile: true }
      }
    }
  })

  logger.info('Appointment created', {
    appointmentId: appointment.id,
    patientId: appointmentData.patientId,
    doctorId: appointmentData.doctorId,
    scheduledTime,
    createdBy: user.userId
  })

  res.status(201).json({
    message: 'Appointment created successfully',
    appointment
  })
})

/**
 * Update appointment
 */
export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!
  const updateData = req.body

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid appointment ID format')
  }

  const prisma = DatabaseService.getInstance()

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true
    }
  })

  if (!appointment) {
    throw new NotFoundError('Appointment')
  }

  // Check permissions
  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId }
    })
    if (!patient || appointment.patientId !== patient.id) {
      throw new ForbiddenError('You can only update your own appointments')
    }
    // Patients can only update certain fields
    const allowedFields = ['reason', 'notes']
    const updateFields = Object.keys(updateData)
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field))
    if (invalidFields.length > 0) {
      throw new ForbiddenError(`Patients cannot update fields: ${invalidFields.join(', ')}`)
    }
  } else if (user.role === 'DOCTOR' && appointment.doctorId !== user.userId) {
    throw new ForbiddenError('You can only update your own appointments')
  }

  // Build update data
  const updateFields: any = {}
  if (updateData.scheduledTime) {
    updateFields.scheduledTime = new Date(updateData.scheduledTime)
  }
  if (updateData.duration) {
    updateFields.duration = updateData.duration
  }
  if (updateData.type) {
    updateFields.type = validateAndSanitizeInput(updateData.type, 'string')
  }
  if (updateData.reason !== undefined) {
    updateFields.reason = updateData.reason ? validateAndSanitizeInput(updateData.reason, 'string') : null
  }
  if (updateData.notes !== undefined) {
    updateFields.notes = updateData.notes ? validateAndSanitizeInput(updateData.notes, 'string') : null
  }
  if (updateData.status && user.role !== 'PATIENT') {
    updateFields.status = updateData.status
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: updateFields,
    include: {
      patient: {
        include: {
          user: {
            include: { profile: true }
          }
        }
      },
      doctor: {
        include: { profile: true }
      }
    }
  })

  logger.info('Appointment updated', {
    appointmentId: id,
    updatedBy: user.userId,
    updatedFields: Object.keys(updateFields)
  })

  res.json({
    message: 'Appointment updated successfully',
    appointment: updatedAppointment
  })
})

/**
 * Cancel appointment
 */
export const cancelAppointment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!
  const { reason } = req.body

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid appointment ID format')
  }

  const prisma = DatabaseService.getInstance()

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { patient: true }
  })

  if (!appointment) {
    throw new NotFoundError('Appointment')
  }

  // Check permissions
  if (user.role === 'PATIENT') {
    const patient = await prisma.patient.findUnique({
      where: { userId: user.userId }
    })
    if (!patient || appointment.patientId !== patient.id) {
      throw new ForbiddenError('You can only cancel your own appointments')
    }
  } else if (user.role === 'DOCTOR' && appointment.doctorId !== user.userId) {
    throw new ForbiddenError('You can only cancel your own appointments')
  }

  if (appointment.status === 'CANCELLED') {
    throw new ConflictError('Appointment is already cancelled')
  }

  if (appointment.status === 'COMPLETED') {
    throw new ConflictError('Cannot cancel a completed appointment')
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      notes: reason ? `Cancelled: ${validateAndSanitizeInput(reason, 'string')}` : 'Cancelled',
    },
    include: {
      patient: {
        include: {
          user: {
            include: { profile: true }
          }
        }
      },
      doctor: {
        include: { profile: true }
      }
    }
  })

  logger.info('Appointment cancelled', {
    appointmentId: id,
    cancelledBy: user.userId,
    reason: reason || 'No reason provided'
  })

  res.json({
    message: 'Appointment cancelled successfully',
    appointment: updatedAppointment
  })
})
