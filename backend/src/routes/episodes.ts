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
const createEpisodeSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  chiefComplaint: z.string().min(1, 'Chief complaint is required'),
  symptoms: z.array(z.string()).optional(),
  vitalSigns: z.object({
    temperature: z.number().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
  }).optional(),
  notes: z.string().optional(),
})

const updateEpisodeSchema = z.object({
  chiefComplaint: z.string().min(1).optional(),
  symptoms: z.array(z.string()).optional(),
  vitalSigns: z.object({
    temperature: z.number().optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
  }).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
})

/**
 * POST /api/episodes
 * Create a new episode
 * Accessible to: DOCTOR, NURSE
 */
router.post('/', 
  requireRole(['DOCTOR', 'NURSE']), 
  asyncHandler(async (req, res) => {
    const validatedData = createEpisodeSchema.parse(req.body)
    
    // Verify patient exists
    const patient = await databaseService.prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    })
    
    if (!patient) {
      throw new NotFoundError('Patient')
    }
    
    // Create episode
    const episode = await databaseService.prisma.episode.create({
      data: {
        patientId: validatedData.patientId,
        chiefComplaint: validatedData.chiefComplaint,
        symptoms: validatedData.symptoms || [],
        vitalSigns: validatedData.vitalSigns || {},
        notes: validatedData.notes,
        createdById: req.user!.userId,
      },
      include: {
        patient: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        createdBy: {
          include: {
            profile: true
          }
        }
      }
    })
    
    logger.info('Episode created successfully', {
      episodeId: episode.id,
      patientId: episode.patientId,
      createdBy: req.user!.userId,
      userRole: req.user!.role,
    })
    
    res.status(201).json({
      message: 'Episode created successfully',
      data: episode
    })
  })
)

/**
 * GET /api/episodes
 * Get episodes with filtering and pagination
 * Accessible to: DOCTOR, NURSE, RECEPTIONIST
 */
router.get('/', 
  requireRole(['DOCTOR', 'NURSE', 'RECEPTIONIST']), 
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50)
    const skip = (page - 1) * limit
    
    const patientId = req.query.patientId as string
    const status = req.query.status as string
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string
    
    // Build where clause
    const where: any = {}
    
    if (patientId) {
      where.patientId = patientId
    }
    
    if (status) {
      where.status = status
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }
    
    // Get episodes with pagination
    const [episodes, totalCount] = await Promise.all([
      databaseService.prisma.episode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            include: {
              user: {
                include: {
                  profile: true
                }
              }
            }
          },
          createdBy: {
            include: {
              profile: true
            }
          },
          prescriptions: {
            include: {
              medication: true
            }
          }
        }
      }),
      databaseService.prisma.episode.count({ where })
    ])
    
    res.json({
      message: 'Episodes retrieved successfully',
      data: {
        episodes,
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
 * GET /api/episodes/:id
 * Get episode by ID
 * Accessible to: DOCTOR, NURSE, RECEPTIONIST
 */
router.get('/:id', 
  requireRole(['DOCTOR', 'NURSE', 'RECEPTIONIST']), 
  asyncHandler(async (req, res) => {
    const episodeId = req.params.id
    
    const episode = await databaseService.prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        patient: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        createdBy: {
          include: {
            profile: true
          }
        },
        prescriptions: {
          include: {
            medication: true,
            prescribedBy: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    })
    
    if (!episode) {
      throw new NotFoundError('Episode')
    }
    
    res.json({
      message: 'Episode retrieved successfully',
      data: episode
    })
  })
)

/**
 * PUT /api/episodes/:id
 * Update episode
 * Accessible to: DOCTOR, NURSE
 */
router.put('/:id', 
  requireRole(['DOCTOR', 'NURSE']), 
  asyncHandler(async (req, res) => {
    const episodeId = req.params.id
    const validatedData = updateEpisodeSchema.parse(req.body)
    
    // Check if episode exists
    const existingEpisode = await databaseService.prisma.episode.findUnique({
      where: { id: episodeId }
    })
    
    if (!existingEpisode) {
      throw new NotFoundError('Episode')
    }
    
    // Update episode
    const episode = await databaseService.prisma.episode.update({
      where: { id: episodeId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        },
        createdBy: {
          include: {
            profile: true
          }
        },
        prescriptions: {
          include: {
            medication: true
          }
        }
      }
    })
    
    logger.info('Episode updated successfully', {
      episodeId: episode.id,
      updatedBy: req.user!.userId,
      userRole: req.user!.role,
      status: episode.status,
    })
    
    res.json({
      message: 'Episode updated successfully',
      data: episode
    })
  })
)

/**
 * GET /api/episodes/patient/:patientId
 * Get all episodes for a specific patient
 * Accessible to: DOCTOR, NURSE, RECEPTIONIST, PATIENT (own episodes only)
 */
router.get('/patient/:patientId', asyncHandler(async (req, res) => {
  const patientId = req.params.patientId
  const userRole = req.user!.role
  
  // If user is a patient, they can only access their own episodes
  if (userRole === 'PATIENT') {
    const patient = await databaseService.prisma.patient.findFirst({
      where: { 
        id: patientId,
        userId: req.user!.userId 
      }
    })
    
    if (!patient) {
      throw new ForbiddenError('Access denied to patient episodes')
    }
  } else if (!['DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(userRole)) {
    throw new ForbiddenError('Insufficient permissions')
  }
  
  const episodes = await databaseService.prisma.episode.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        include: {
          profile: true
        }
      },
      prescriptions: {
        include: {
          medication: true
        }
      }
    }
  })
  
  res.json({
    message: 'Patient episodes retrieved successfully',
    data: episodes
  })
}))

export default router
