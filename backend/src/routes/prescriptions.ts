import { Router } from 'express'
import { z } from 'zod'
import { databaseService } from '@/services/database'
import { authenticate, requireRole } from '@/middleware/auth'
import { generalRateLimit } from '@/middleware/rateLimiter'
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler'
import { logger } from '@/utils/logger'

const router = Router()

// Apply authentication and rate limiting
router.use(authenticate)
router.use(generalRateLimit)

// Validation schemas
const createPrescriptionSchema = z.object({
  episodeId: z.string().uuid('Invalid episode ID'),
  medicationId: z.string().uuid('Invalid medication ID'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
})

const updatePrescriptionSchema = z.object({
  dosage: z.string().min(1).optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
  quantity: z.number().min(1).optional(),
  status: z.enum(['PENDING', 'DISPENSED', 'CANCELLED']).optional(),
})

const dispensePrescriptionSchema = z.object({
  dispensedQuantity: z.number().min(1, 'Dispensed quantity must be at least 1'),
  dispensingNotes: z.string().optional(),
})

/**
 * POST /api/prescriptions
 * Create a new prescription
 * Accessible to: DOCTOR
 */
router.post('/', 
  requireRole(['DOCTOR']), 
  asyncHandler(async (req, res) => {
    const validatedData = createPrescriptionSchema.parse(req.body)
    
    // Verify episode exists and belongs to a patient
    const episode = await databaseService.prisma.episode.findUnique({
      where: { id: validatedData.episodeId },
      include: { patient: true }
    })
    
    if (!episode) {
      throw new NotFoundError('Episode')
    }
    
    // Verify medication exists
    const medication = await databaseService.prisma.medication.findUnique({
      where: { id: validatedData.medicationId }
    })
    
    if (!medication) {
      throw new NotFoundError('Medication')
    }
    
    // Create prescription
    const prescription = await databaseService.prisma.prescription.create({
      data: {
        episodeId: validatedData.episodeId,
        medicationId: validatedData.medicationId,
        dosage: validatedData.dosage,
        frequency: validatedData.frequency,
        duration: validatedData.duration,
        instructions: validatedData.instructions,
        quantity: validatedData.quantity,
        prescribedById: req.user!.userId,
      },
      include: {
        episode: {
          include: {
            patient: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        medication: true,
        prescribedBy: {
          include: {
            profile: true
          }
        }
      }
    })
    
    logger.info('Prescription created successfully', {
      prescriptionId: prescription.id,
      episodeId: prescription.episodeId,
      medicationId: prescription.medicationId,
      prescribedBy: req.user!.userId,
    })
    
    res.status(201).json({
      message: 'Prescription created successfully',
      data: prescription
    })
  })
)

/**
 * GET /api/prescriptions
 * Get prescriptions with filtering and pagination
 * Accessible to: DOCTOR, NURSE, PHARMACIST
 */
router.get('/', 
  requireRole(['DOCTOR', 'NURSE', 'PHARMACIST']), 
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50)
    const skip = (page - 1) * limit
    
    const patientId = req.query.patientId as string
    const status = req.query.status as string
    const medicationId = req.query.medicationId as string
    
    // Build where clause
    const where: any = {}
    
    if (patientId) {
      where.episode = {
        patientId: patientId
      }
    }
    
    if (status) {
      where.status = status
    }
    
    if (medicationId) {
      where.medicationId = medicationId
    }
    
    // Get prescriptions with pagination
    const [prescriptions, totalCount] = await Promise.all([
      databaseService.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          episode: {
            include: {
              patient: {
                include: {
                  user: {
                    include: {
                      profile: true
                    }
                  }
                }
              }
            }
          },
          medication: true,
          prescribedBy: {
            include: {
              profile: true
            }
          },
          dispensedBy: {
            include: {
              profile: true
            }
          }
        }
      }),
      databaseService.prisma.prescription.count({ where })
    ])
    
    res.json({
      message: 'Prescriptions retrieved successfully',
      data: {
        prescriptions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    })
  })
)

/**
 * GET /api/prescriptions/:id
 * Get prescription by ID
 * Accessible to: DOCTOR, NURSE, PHARMACIST
 */
router.get('/:id', 
  requireRole(['DOCTOR', 'NURSE', 'PHARMACIST']), 
  asyncHandler(async (req, res) => {
    const prescriptionId = req.params.id
    
    const prescription = await databaseService.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        episode: {
          include: {
            patient: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        medication: true,
        prescribedBy: {
          include: {
            profile: true
          }
        },
        dispensedBy: {
          include: {
            profile: true
          }
        }
      }
    })
    
    if (!prescription) {
      throw new NotFoundError('Prescription')
    }
    
    res.json({
      message: 'Prescription retrieved successfully',
      data: prescription
    })
  })
)

/**
 * PUT /api/prescriptions/:id
 * Update prescription
 * Accessible to: DOCTOR (who prescribed it)
 */
router.put('/:id', 
  requireRole(['DOCTOR']), 
  asyncHandler(async (req, res) => {
    const prescriptionId = req.params.id
    const validatedData = updatePrescriptionSchema.parse(req.body)
    
    // Check if prescription exists and was prescribed by current user
    const existingPrescription = await databaseService.prisma.prescription.findUnique({
      where: { id: prescriptionId }
    })
    
    if (!existingPrescription) {
      throw new NotFoundError('Prescription')
    }
    
    if (existingPrescription.prescribedById !== req.user!.userId) {
      throw new ForbiddenError('You can only update prescriptions you created')
    }
    
    if (existingPrescription.status === 'DISPENSED') {
      throw new ValidationError('Cannot update dispensed prescription')
    }
    
    // Update prescription
    const prescription = await databaseService.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        episode: {
          include: {
            patient: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        medication: true,
        prescribedBy: {
          include: {
            profile: true
          }
        }
      }
    })
    
    logger.info('Prescription updated successfully', {
      prescriptionId: prescription.id,
      updatedBy: req.user!.userId,
      status: prescription.status,
    })
    
    res.json({
      message: 'Prescription updated successfully',
      data: prescription
    })
  })
)

/**
 * POST /api/prescriptions/:id/dispense
 * Dispense prescription
 * Accessible to: PHARMACIST
 */
router.post('/:id/dispense', 
  requireRole(['PHARMACIST']), 
  asyncHandler(async (req, res) => {
    const prescriptionId = req.params.id
    const validatedData = dispensePrescriptionSchema.parse(req.body)
    
    // Check if prescription exists and is pending
    const existingPrescription = await databaseService.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        medication: true,
        episode: {
          include: {
            patient: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    if (!existingPrescription) {
      throw new NotFoundError('Prescription')
    }
    
    if (existingPrescription.status !== 'PENDING') {
      throw new ValidationError('Prescription is not pending dispensing')
    }
    
    if (validatedData.dispensedQuantity > existingPrescription.quantity) {
      throw new ValidationError('Dispensed quantity cannot exceed prescribed quantity')
    }
    
    // Update prescription as dispensed
    const prescription = await databaseService.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'DISPENSED',
        dispensedQuantity: validatedData.dispensedQuantity,
        dispensingNotes: validatedData.dispensingNotes,
        dispensedById: req.user!.userId,
        dispensedAt: new Date(),
      },
      include: {
        episode: {
          include: {
            patient: {
              include: {
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        medication: true,
        prescribedBy: {
          include: {
            profile: true
          }
        },
        dispensedBy: {
          include: {
            profile: true
          }
        }
      }
    })
    
    logger.info('Prescription dispensed successfully', {
      prescriptionId: prescription.id,
      dispensedBy: req.user!.userId,
      dispensedQuantity: validatedData.dispensedQuantity,
      patientId: prescription.episode.patient.id,
    })
    
    res.json({
      message: 'Prescription dispensed successfully',
      data: prescription
    })
  })
)

export default router
