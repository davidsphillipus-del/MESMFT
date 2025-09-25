import { Request, Response } from 'express'
import { DatabaseService } from '@/services/database'
import { logger } from '@/utils/logger'
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  ForbiddenError,
  asyncHandler 
} from '@/middleware/errorHandler'
import { 
  validateUUID, 
  validateVitalSigns, 
  validateLabResult,
  validateAndSanitizeInput 
} from '@/utils/validation'

/**
 * Get all patients (for healthcare providers)
 */
export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, search, sort = 'createdAt:desc' } = req.query
  const user = req.user!

  // Only healthcare providers can view all patients
  if (user.role === 'PATIENT') {
    throw new ForbiddenError('Patients can only view their own records')
  }

  const prisma = DatabaseService.getInstance()
  const pageNum = parseInt(page as string, 10)
  const limitNum = Math.min(parseInt(limit as string, 10), 100)
  const offset = (pageNum - 1) * limitNum

  // Build search conditions
  const searchConditions: any = {}
  if (search) {
    searchConditions.OR = [
      { patientId: { contains: search as string, mode: 'insensitive' } },
      { user: { 
        profile: { 
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } }
          ]
        }
      }}
    ]
  }

  // Build sort conditions
  const [sortField, sortDirection] = (sort as string).split(':')
  const orderBy: any = {}
  if (sortField === 'name') {
    orderBy.user = { profile: { firstName: sortDirection || 'asc' } }
  } else {
    orderBy[sortField] = sortDirection || 'desc'
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where: searchConditions,
      include: {
        user: {
          include: {
            profile: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limitNum,
    }),
    prisma.patient.count({ where: searchConditions })
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.json({
    data: patients,
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
 * Get patient by ID
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  const prisma = DatabaseService.getInstance()

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      medicalRecords: {
        orderBy: { createdAt: 'desc' },
        take: 10 // Latest 10 records
      },
      episodes: {
        include: {
          doctor: {
            include: { profile: true }
          },
          nurse: {
            include: { profile: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      appointments: {
        include: {
          doctor: {
            include: { profile: true }
          }
        },
        orderBy: { scheduledTime: 'desc' },
        take: 10
      }
    }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  // Check access permissions
  if (user.role === 'PATIENT' && patient.userId !== user.userId) {
    throw new ForbiddenError('You can only access your own patient records')
  }

  res.json({ patient })
})

/**
 * Update patient information
 */
export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!
  const { 
    dateOfBirth, 
    gender, 
    bloodType, 
    allergies,
    emergencyContact,
    address,
    phone 
  } = req.body

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  const prisma = DatabaseService.getInstance()

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { user: true }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  // Check permissions
  if (user.role === 'PATIENT' && patient.userId !== user.userId) {
    throw new ForbiddenError('You can only update your own patient records')
  }

  // Update patient data
  const updateData: any = {}
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth)
  if (gender) updateData.gender = gender
  if (bloodType) updateData.bloodType = bloodType
  if (allergies !== undefined) updateData.allergies = validateAndSanitizeInput(allergies, 'string')

  // Update user profile data
  const profileUpdateData: any = {}
  if (emergencyContact) profileUpdateData.emergencyContact = validateAndSanitizeInput(emergencyContact, 'string')
  if (address) profileUpdateData.address = validateAndSanitizeInput(address, 'string')
  if (phone) profileUpdateData.phone = validateAndSanitizeInput(phone, 'phone')

  const updatedPatient = await prisma.patient.update({
    where: { id },
    data: {
      ...updateData,
      ...(Object.keys(profileUpdateData).length > 0 && {
        user: {
          update: {
            profile: {
              update: profileUpdateData
            }
          }
        }
      })
    },
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  })

  logger.info('Patient updated', {
    patientId: id,
    updatedBy: user.userId,
    updatedFields: Object.keys({ ...updateData, ...profileUpdateData })
  })

  res.json({
    message: 'Patient updated successfully',
    patient: updatedPatient
  })
})

/**
 * Get patient medical records
 */
export const getMedicalRecords = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { page = 1, limit = 20, type } = req.query
  const user = req.user!

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists and check permissions
  const patient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  if (user.role === 'PATIENT' && patient.userId !== user.userId) {
    throw new ForbiddenError('You can only access your own medical records')
  }

  const pageNum = parseInt(page as string, 10)
  const limitNum = Math.min(parseInt(limit as string, 10), 100)
  const offset = (pageNum - 1) * limitNum

  const whereConditions: any = { patientId: id }
  if (type) {
    whereConditions.recordType = type
  }

  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limitNum,
    }),
    prisma.medicalRecord.count({ where: whereConditions })
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.json({
    data: records,
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
 * Add medical record
 */
export const addMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!
  const { recordType, title, description, data, attachments } = req.body

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  if (!recordType || !title) {
    throw new ValidationError('Record type and title are required')
  }

  // Only healthcare providers can add medical records
  if (user.role === 'PATIENT') {
    throw new ForbiddenError('Patients cannot add medical records')
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  const record = await prisma.medicalRecord.create({
    data: {
      patientId: id,
      recordType: validateAndSanitizeInput(recordType, 'string'),
      title: validateAndSanitizeInput(title, 'string'),
      description: description ? validateAndSanitizeInput(description, 'string') : null,
      data: data || {},
      attachments: attachments || [],
      createdBy: user.userId,
    }
  })

  logger.info('Medical record added', {
    recordId: record.id,
    patientId: id,
    recordType,
    createdBy: user.userId
  })

  res.status(201).json({
    message: 'Medical record added successfully',
    record
  })
})

/**
 * Get patient vital signs
 */
export const getVitalSigns = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { page = 1, limit = 20, startDate, endDate } = req.query
  const user = req.user!

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists and check permissions
  const patient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  if (user.role === 'PATIENT' && patient.userId !== user.userId) {
    throw new ForbiddenError('You can only access your own vital signs')
  }

  const pageNum = parseInt(page as string, 10)
  const limitNum = Math.min(parseInt(limit as string, 10), 100)
  const offset = (pageNum - 1) * limitNum

  const whereConditions: any = { patientId: patient.userId }

  if (startDate || endDate) {
    whereConditions.recordedAt = {}
    if (startDate) whereConditions.recordedAt.gte = new Date(startDate as string)
    if (endDate) whereConditions.recordedAt.lte = new Date(endDate as string)
  }

  const [vitals, total] = await Promise.all([
    prisma.vitalSign.findMany({
      where: whereConditions,
      include: {
        recordedByUser: {
          include: { profile: true }
        }
      },
      orderBy: { recordedAt: 'desc' },
      skip: offset,
      take: limitNum,
    }),
    prisma.vitalSign.count({ where: whereConditions })
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.json({
    data: vitals,
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
 * Add vital signs
 */
export const addVitalSigns = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!
  const vitalData = req.body

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  // Only healthcare providers can add vital signs
  if (user.role === 'PATIENT') {
    throw new ForbiddenError('Patients cannot add vital signs')
  }

  // Validate vital signs data
  const validation = validateVitalSigns(vitalData)
  if (!validation.isValid) {
    throw new ValidationError('Invalid vital signs data', { errors: validation.errors })
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  const vitals = await prisma.vitalSign.create({
    data: {
      patientId: patient.userId,
      temperature: vitalData.temperature,
      bloodPressure: vitalData.bloodPressure,
      heartRate: vitalData.heartRate,
      respiratoryRate: vitalData.respiratoryRate,
      oxygenSaturation: vitalData.oxygenSaturation,
      weight: vitalData.weight,
      height: vitalData.height,
      recordedBy: user.userId,
      recordedAt: vitalData.recordedAt ? new Date(vitalData.recordedAt) : new Date(),
    },
    include: {
      recordedByUser: {
        include: { profile: true }
      }
    }
  })

  logger.info('Vital signs recorded', {
    vitalId: vitals.id,
    patientId: id,
    recordedBy: user.userId
  })

  res.status(201).json({
    message: 'Vital signs recorded successfully',
    vitals
  })
})

/**
 * Get patient lab results
 */
export const getLabResults = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { page = 1, limit = 20, testType, startDate, endDate } = req.query
  const user = req.user!

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists and check permissions
  const patient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  if (user.role === 'PATIENT' && patient.userId !== user.userId) {
    throw new ForbiddenError('You can only access your own lab results')
  }

  const pageNum = parseInt(page as string, 10)
  const limitNum = Math.min(parseInt(limit as string, 10), 100)
  const offset = (pageNum - 1) * limitNum

  const whereConditions: any = { patientId: patient.userId }

  if (testType) {
    whereConditions.testType = { contains: testType as string, mode: 'insensitive' }
  }

  if (startDate || endDate) {
    whereConditions.performedAt = {}
    if (startDate) whereConditions.performedAt.gte = new Date(startDate as string)
    if (endDate) whereConditions.performedAt.lte = new Date(endDate as string)
  }

  const [results, total] = await Promise.all([
    prisma.labResult.findMany({
      where: whereConditions,
      include: {
        orderedByUser: {
          include: { profile: true }
        }
      },
      orderBy: { performedAt: 'desc' },
      skip: offset,
      take: limitNum,
    }),
    prisma.labResult.count({ where: whereConditions })
  ])

  const totalPages = Math.ceil(total / limitNum)

  res.json({
    data: results,
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
 * Add lab result
 */
export const addLabResult = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = req.user!
  const resultData = req.body

  if (!validateUUID(id)) {
    throw new ValidationError('Invalid patient ID format')
  }

  // Only healthcare providers can add lab results
  if (user.role === 'PATIENT') {
    throw new ForbiddenError('Patients cannot add lab results')
  }

  // Validate lab result data
  const validation = validateLabResult(resultData)
  if (!validation.isValid) {
    throw new ValidationError('Invalid lab result data', { errors: validation.errors })
  }

  const prisma = DatabaseService.getInstance()

  // Verify patient exists
  const patient = await prisma.patient.findUnique({
    where: { id }
  })

  if (!patient) {
    throw new NotFoundError('Patient')
  }

  const result = await prisma.labResult.create({
    data: {
      patientId: patient.userId,
      testType: validateAndSanitizeInput(resultData.testType, 'string'),
      testName: validateAndSanitizeInput(resultData.testName, 'string'),
      results: resultData.results,
      referenceRanges: resultData.referenceRanges || {},
      status: resultData.status || 'COMPLETED',
      orderedBy: user.userId,
      performedAt: resultData.performedAt ? new Date(resultData.performedAt) : new Date(),
    },
    include: {
      orderedByUser: {
        include: { profile: true }
      }
    }
  })

  logger.info('Lab result added', {
    resultId: result.id,
    patientId: id,
    testType: resultData.testType,
    orderedBy: user.userId
  })

  res.status(201).json({
    message: 'Lab result added successfully',
    result
  })
}))
