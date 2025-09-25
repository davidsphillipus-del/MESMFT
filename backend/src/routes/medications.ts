import { Router } from 'express'
import { z } from 'zod'
import { databaseService } from '@/services/database'
import { authenticate, requireRole } from '@/middleware/auth'
import { generalRateLimit } from '@/middleware/rateLimiter'
import { asyncHandler, ValidationError, NotFoundError, ConflictError } from '@/middleware/errorHandler'
import { logger } from '@/utils/logger'

const router = Router()

// Apply authentication and rate limiting
router.use(authenticate)
router.use(generalRateLimit)

// Validation schemas
const createMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  genericName: z.string().optional(),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  strength: z.string().min(1, 'Strength is required'),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
})

const updateMedicationSchema = z.object({
  name: z.string().min(1).optional(),
  genericName: z.string().optional(),
  dosageForm: z.string().min(1).optional(),
  strength: z.string().min(1).optional(),
  manufacturer: z.string().optional(),
  description: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  contraindications: z.array(z.string()).optional(),
  interactions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

/**
 * POST /api/medications
 * Create a new medication
 * Accessible to: ADMIN, PHARMACIST
 */
router.post('/', 
  requireRole(['ADMIN', 'PHARMACIST']), 
  asyncHandler(async (req, res) => {
    const validatedData = createMedicationSchema.parse(req.body)
    
    // Check if medication with same name already exists
    const existingMedication = await databaseService.prisma.medication.findFirst({
      where: { 
        name: validatedData.name,
        strength: validatedData.strength,
        dosageForm: validatedData.dosageForm
      }
    })
    
    if (existingMedication) {
      throw new ConflictError('Medication with same name, strength, and dosage form already exists')
    }
    
    // Create medication
    const medication = await databaseService.prisma.medication.create({
      data: {
        ...validatedData,
        sideEffects: validatedData.sideEffects || [],
        contraindications: validatedData.contraindications || [],
        interactions: validatedData.interactions || [],
      }
    })
    
    logger.info('Medication created successfully', {
      medicationId: medication.id,
      name: medication.name,
      createdBy: req.user!.userId,
    })
    
    res.status(201).json({
      message: 'Medication created successfully',
      data: medication
    })
  })
)

/**
 * GET /api/medications
 * Get medications with filtering and pagination
 * Accessible to: All authenticated users
 */
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const skip = (page - 1) * limit
  
  const search = req.query.search as string
  const dosageForm = req.query.dosageForm as string
  const isActive = req.query.isActive as string
  
  // Build where clause
  const where: any = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { genericName: { contains: search, mode: 'insensitive' } },
      { manufacturer: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (dosageForm) {
    where.dosageForm = dosageForm
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true'
  }
  
  // Get medications with pagination
  const [medications, totalCount] = await Promise.all([
    databaseService.prisma.medication.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    databaseService.prisma.medication.count({ where })
  ])
  
  res.json({
    message: 'Medications retrieved successfully',
    data: {
      medications,
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
}))

/**
 * GET /api/medications/:id
 * Get medication by ID
 * Accessible to: All authenticated users
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const medicationId = req.params.id
  
  const medication = await databaseService.prisma.medication.findUnique({
    where: { id: medicationId },
    include: {
      prescriptions: {
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
          }
        },
        take: 10, // Limit recent prescriptions
        orderBy: { createdAt: 'desc' }
      },
      inventory: {
        orderBy: { createdAt: 'desc' },
        take: 5 // Recent inventory records
      }
    }
  })
  
  if (!medication) {
    throw new NotFoundError('Medication')
  }
  
  res.json({
    message: 'Medication retrieved successfully',
    data: medication
  })
}))

/**
 * PUT /api/medications/:id
 * Update medication
 * Accessible to: ADMIN, PHARMACIST
 */
router.put('/:id', 
  requireRole(['ADMIN', 'PHARMACIST']), 
  asyncHandler(async (req, res) => {
    const medicationId = req.params.id
    const validatedData = updateMedicationSchema.parse(req.body)
    
    // Check if medication exists
    const existingMedication = await databaseService.prisma.medication.findUnique({
      where: { id: medicationId }
    })
    
    if (!existingMedication) {
      throw new NotFoundError('Medication')
    }
    
    // Check for conflicts if name/strength/form is being updated
    if (validatedData.name || validatedData.strength || validatedData.dosageForm) {
      const conflictCheck = await databaseService.prisma.medication.findFirst({
        where: {
          id: { not: medicationId },
          name: validatedData.name || existingMedication.name,
          strength: validatedData.strength || existingMedication.strength,
          dosageForm: validatedData.dosageForm || existingMedication.dosageForm
        }
      })
      
      if (conflictCheck) {
        throw new ConflictError('Medication with same name, strength, and dosage form already exists')
      }
    }
    
    // Update medication
    const medication = await databaseService.prisma.medication.update({
      where: { id: medicationId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      }
    })
    
    logger.info('Medication updated successfully', {
      medicationId: medication.id,
      updatedBy: req.user!.userId,
    })
    
    res.json({
      message: 'Medication updated successfully',
      data: medication
    })
  })
)

/**
 * GET /api/medications/search/:query
 * Search medications by name or generic name
 * Accessible to: All authenticated users
 */
router.get('/search/:query', asyncHandler(async (req, res) => {
  const query = req.params.query
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50)
  
  if (query.length < 2) {
    throw new ValidationError('Search query must be at least 2 characters')
  }
  
  const medications = await databaseService.prisma.medication.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { genericName: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    },
    take: limit,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      genericName: true,
      dosageForm: true,
      strength: true,
      manufacturer: true
    }
  })
  
  res.json({
    message: 'Medication search completed successfully',
    data: {
      medications,
      query,
      resultCount: medications.length
    }
  })
}))

/**
 * GET /api/medications/:id/interactions
 * Check drug interactions for a medication
 * Accessible to: DOCTOR, NURSE, PHARMACIST
 */
router.get('/:id/interactions', 
  requireRole(['DOCTOR', 'NURSE', 'PHARMACIST']), 
  asyncHandler(async (req, res) => {
    const medicationId = req.params.id
    const otherMedicationIds = req.query.with as string | string[]
    
    const medication = await databaseService.prisma.medication.findUnique({
      where: { id: medicationId },
      select: {
        id: true,
        name: true,
        interactions: true
      }
    })
    
    if (!medication) {
      throw new NotFoundError('Medication')
    }
    
    let interactions: any[] = []
    
    if (otherMedicationIds) {
      const ids = Array.isArray(otherMedicationIds) ? otherMedicationIds : [otherMedicationIds]
      
      const otherMedications = await databaseService.prisma.medication.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          interactions: true
        }
      })
      
      // Check for interactions (simplified logic)
      interactions = otherMedications.map(otherMed => {
        const hasInteraction = medication.interactions.some(interaction =>
          otherMed.name.toLowerCase().includes(interaction.toLowerCase()) ||
          interaction.toLowerCase().includes(otherMed.name.toLowerCase())
        )
        
        return {
          medicationId: otherMed.id,
          medicationName: otherMed.name,
          hasInteraction,
          severity: hasInteraction ? 'MODERATE' : 'NONE',
          description: hasInteraction ? `Potential interaction between ${medication.name} and ${otherMed.name}` : null
        }
      })
    }
    
    res.json({
      message: 'Drug interaction check completed',
      data: {
        medication: {
          id: medication.id,
          name: medication.name
        },
        interactions,
        checkedAt: new Date().toISOString()
      }
    })
  })
)

export default router
