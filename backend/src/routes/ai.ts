import { Router } from 'express'
import { z } from 'zod'
import { aiService, DiagnosisRequest, EducationRequest } from '@/services/aiService'
import { authenticate, requireRole } from '@/middleware/auth'
import { aiRateLimit } from '@/middleware/rateLimiter'
import { asyncHandler, ValidationError } from '@/middleware/errorHandler'
import { logger } from '@/utils/logger'

const router = Router()

// Apply authentication and rate limiting to all AI routes
router.use(authenticate)
router.use(aiRateLimit)

// Validation schemas
const diagnosisSchema = z.object({
  symptoms: z.array(z.string().min(1, 'Symptom cannot be empty')).min(1, 'At least one symptom is required'),
  patientAge: z.number().min(0).max(150).optional(),
  patientGender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  medicalHistory: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
})

const educationSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  complexity: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']).optional(),
})

/**
 * POST /api/ai/diagnosis
 * Generate AI-powered diagnosis suggestions
 * Accessible to: DOCTOR, NURSE
 */
router.post('/diagnosis', 
  requireRole(['DOCTOR', 'NURSE']), 
  asyncHandler(async (req, res) => {
    const validatedData = diagnosisSchema.parse(req.body)
    
    const diagnosisRequest: DiagnosisRequest = {
      ...validatedData,
      patientAge: validatedData.patientAge,
      patientGender: validatedData.patientGender,
      medicalHistory: validatedData.medicalHistory || [],
      currentMedications: validatedData.currentMedications || [],
    }
    
    logger.info('AI diagnosis request initiated', {
      userId: req.user!.userId,
      userRole: req.user!.role,
      symptomsCount: diagnosisRequest.symptoms.length,
      hasPatientAge: !!diagnosisRequest.patientAge,
      hasPatientGender: !!diagnosisRequest.patientGender,
    })
    
    const diagnosis = await aiService.generateDiagnosis(diagnosisRequest)
    
    // Log the diagnosis for audit purposes
    logger.info('AI diagnosis completed', {
      userId: req.user!.userId,
      userRole: req.user!.role,
      conditionsCount: diagnosis.possibleConditions.length,
      highUrgencyConditions: diagnosis.possibleConditions.filter(c => c.urgency === 'HIGH' || c.urgency === 'EMERGENCY').length,
    })
    
    res.json({
      message: 'Diagnosis suggestions generated successfully',
      data: diagnosis,
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: {
          userId: req.user!.userId,
          role: req.user!.role,
        }
      }
    })
  })
)

/**
 * POST /api/ai/education
 * Generate educational content
 * Accessible to: All authenticated users
 */
router.post('/education', asyncHandler(async (req, res) => {
  const validatedData = educationSchema.parse(req.body)
  
  const educationRequest: EducationRequest = {
    topic: validatedData.topic,
    userRole: req.user!.role as any,
    complexity: validatedData.complexity || 'BASIC',
  }
  
  logger.info('AI education request initiated', {
    userId: req.user!.userId,
    userRole: req.user!.role,
    topic: educationRequest.topic,
    complexity: educationRequest.complexity,
  })
  
  const educationalContent = await aiService.generateEducationalContent(educationRequest)
  
  logger.info('AI education content generated', {
    userId: req.user!.userId,
    userRole: req.user!.role,
    topic: educationRequest.topic,
    contentLength: educationalContent.content.length,
    keyPointsCount: educationalContent.keyPoints.length,
  })
  
  res.json({
    message: 'Educational content generated successfully',
    data: educationalContent,
    metadata: {
      generatedAt: new Date().toISOString(),
      requestedBy: {
        userId: req.user!.userId,
        role: req.user!.role,
      },
      topic: educationRequest.topic,
      complexity: educationRequest.complexity,
    }
  })
}))

/**
 * GET /api/ai/diagnosis/history
 * Get diagnosis history for audit purposes
 * Accessible to: DOCTOR, NURSE, ADMIN
 */
router.get('/diagnosis/history', 
  requireRole(['DOCTOR', 'NURSE', 'ADMIN']), 
  asyncHandler(async (req, res) => {
    // This would typically fetch from a diagnosis history table
    // For now, return a placeholder response
    
    logger.info('Diagnosis history requested', {
      userId: req.user!.userId,
      userRole: req.user!.role,
    })
    
    res.json({
      message: 'Diagnosis history retrieved successfully',
      data: {
        history: [],
        totalCount: 0,
        message: 'Diagnosis history tracking will be implemented with database logging'
      },
      metadata: {
        requestedAt: new Date().toISOString(),
        requestedBy: {
          userId: req.user!.userId,
          role: req.user!.role,
        }
      }
    })
  })
)

/**
 * GET /api/ai/education/topics
 * Get available education topics
 * Accessible to: All authenticated users
 */
router.get('/education/topics', asyncHandler(async (req, res) => {
  const topics = [
    {
      category: 'Infectious Diseases',
      topics: [
        'Malaria Prevention and Treatment',
        'Typhoid Fever Management',
        'Common Viral Infections',
        'Bacterial Infections',
        'Parasitic Diseases'
      ]
    },
    {
      category: 'General Health',
      topics: [
        'Nutrition and Diet',
        'Exercise and Physical Activity',
        'Mental Health Awareness',
        'Preventive Care',
        'Vaccination Guidelines'
      ]
    },
    {
      category: 'Emergency Care',
      topics: [
        'First Aid Basics',
        'Emergency Response',
        'Vital Signs Monitoring',
        'Medication Administration',
        'Patient Assessment'
      ]
    },
    {
      category: 'Pharmacy',
      topics: [
        'Drug Interactions',
        'Medication Safety',
        'Dosage Calculations',
        'Storage Guidelines',
        'Patient Counseling'
      ]
    }
  ]
  
  // Filter topics based on user role
  const userRole = req.user!.role
  let filteredTopics = topics
  
  if (userRole === 'PATIENT') {
    filteredTopics = topics.filter(category => 
      ['Infectious Diseases', 'General Health'].includes(category.category)
    )
  }
  
  res.json({
    message: 'Education topics retrieved successfully',
    data: {
      topics: filteredTopics,
      userRole: userRole,
    },
    metadata: {
      requestedAt: new Date().toISOString(),
      requestedBy: {
        userId: req.user!.userId,
        role: req.user!.role,
      }
    }
  })
}))

/**
 * GET /api/ai/status
 * Get AI service status
 * Accessible to: ADMIN
 */
router.get('/status', 
  requireRole(['ADMIN']), 
  asyncHandler(async (req, res) => {
    const isOpenAIEnabled = !!process.env.OPENAI_API_KEY
    
    res.json({
      message: 'AI service status retrieved successfully',
      data: {
        openaiEnabled: isOpenAIEnabled,
        services: {
          diagnosis: {
            enabled: true,
            provider: isOpenAIEnabled ? 'OpenAI GPT-4' : 'Mock Service',
            status: 'operational'
          },
          education: {
            enabled: true,
            provider: isOpenAIEnabled ? 'OpenAI GPT-4' : 'Mock Service',
            status: 'operational'
          }
        },
        rateLimits: {
          aiRequests: '10 per minute per user',
          diagnosisRequests: 'Restricted to DOCTOR and NURSE roles',
          educationRequests: 'Available to all authenticated users'
        }
      },
      metadata: {
        requestedAt: new Date().toISOString(),
        requestedBy: {
          userId: req.user!.userId,
          role: req.user!.role,
        }
      }
    })
  })
)

export default router
