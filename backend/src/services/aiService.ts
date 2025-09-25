import OpenAI from 'openai'
import { logger } from '@/utils/logger'
import { AppError } from '@/middleware/errorHandler'

interface DiagnosisRequest {
  symptoms: string[]
  patientAge?: number
  patientGender?: 'MALE' | 'FEMALE' | 'OTHER'
  medicalHistory?: string[]
  currentMedications?: string[]
}

interface DiagnosisResponse {
  possibleConditions: Array<{
    condition: string
    probability: number
    reasoning: string
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  }>
  recommendations: string[]
  disclaimer: string
}

interface EducationRequest {
  topic: string
  userRole: 'PATIENT' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'PHARMACIST'
  complexity?: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'
}

interface EducationResponse {
  content: string
  keyPoints: string[]
  additionalResources?: string[]
}

class AIService {
  private openai: OpenAI
  private isEnabled: boolean

  constructor() {
    this.isEnabled = !!process.env.OPENAI_API_KEY
    
    if (this.isEnabled) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } else {
      logger.warn('OpenAI API key not provided. AI features will use mock responses.')
    }
  }

  /**
   * Generate AI-powered diagnosis suggestions
   */
  async generateDiagnosis(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    if (!this.isEnabled) {
      return this.getMockDiagnosis(request)
    }

    try {
      const prompt = this.buildDiagnosisPrompt(request)
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant helping healthcare professionals with preliminary diagnosis suggestions. 
            You must always include appropriate medical disclaimers and emphasize that this is not a substitute for professional medical judgment.
            Focus on malaria and typhoid fever as primary considerations given the system's specialization.
            Respond in JSON format with the structure: {
              "possibleConditions": [{"condition": string, "probability": number, "reasoning": string, "urgency": string}],
              "recommendations": [string],
              "disclaimer": string
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new AppError('No response from AI service', 500, 'AI_SERVICE_ERROR')
      }

      const parsedResponse = JSON.parse(response) as DiagnosisResponse
      
      logger.info('AI diagnosis generated successfully', {
        symptomsCount: request.symptoms.length,
        conditionsCount: parsedResponse.possibleConditions.length,
      })

      return parsedResponse
    } catch (error) {
      logger.error('AI diagnosis generation failed', { error: error.message })
      
      if (error instanceof SyntaxError) {
        // Fallback to mock if JSON parsing fails
        return this.getMockDiagnosis(request)
      }
      
      throw new AppError('AI diagnosis service temporarily unavailable', 503, 'AI_SERVICE_ERROR')
    }
  }

  /**
   * Generate educational content
   */
  async generateEducationalContent(request: EducationRequest): Promise<EducationResponse> {
    if (!this.isEnabled) {
      return this.getMockEducationalContent(request)
    }

    try {
      const prompt = this.buildEducationPrompt(request)
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a medical education AI assistant. Provide accurate, evidence-based health information 
            tailored to the user's role and complexity level. Focus on malaria and typhoid fever when relevant.
            Respond in JSON format with the structure: {
              "content": string,
              "keyPoints": [string],
              "additionalResources": [string]
            }`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new AppError('No response from AI service', 500, 'AI_SERVICE_ERROR')
      }

      const parsedResponse = JSON.parse(response) as EducationResponse
      
      logger.info('AI educational content generated successfully', {
        topic: request.topic,
        userRole: request.userRole,
        contentLength: parsedResponse.content.length,
      })

      return parsedResponse
    } catch (error) {
      logger.error('AI educational content generation failed', { error: error.message })
      
      if (error instanceof SyntaxError) {
        return this.getMockEducationalContent(request)
      }
      
      throw new AppError('AI education service temporarily unavailable', 503, 'AI_SERVICE_ERROR')
    }
  }

  private buildDiagnosisPrompt(request: DiagnosisRequest): string {
    let prompt = `Patient presents with the following symptoms: ${request.symptoms.join(', ')}\n`
    
    if (request.patientAge) {
      prompt += `Patient age: ${request.patientAge} years\n`
    }
    
    if (request.patientGender) {
      prompt += `Patient gender: ${request.patientGender}\n`
    }
    
    if (request.medicalHistory?.length) {
      prompt += `Medical history: ${request.medicalHistory.join(', ')}\n`
    }
    
    if (request.currentMedications?.length) {
      prompt += `Current medications: ${request.currentMedications.join(', ')}\n`
    }
    
    prompt += `\nPlease provide differential diagnosis suggestions with probability scores (0-100), 
    reasoning for each condition, and urgency level. Include appropriate medical disclaimers.
    Pay special attention to malaria and typhoid fever as potential diagnoses.`
    
    return prompt
  }

  private buildEducationPrompt(request: EducationRequest): string {
    const complexityMap = {
      BASIC: 'basic, easy-to-understand language suitable for patients',
      INTERMEDIATE: 'intermediate level suitable for healthcare students',
      ADVANCED: 'advanced level suitable for healthcare professionals'
    }
    
    const complexity = complexityMap[request.complexity || 'BASIC']
    
    return `Provide educational content about "${request.topic}" for a ${request.userRole} 
    at ${complexity} level. Include key points and additional resources for further learning.
    Focus on practical, actionable information.`
  }

  private getMockDiagnosis(request: DiagnosisRequest): DiagnosisResponse {
    // Mock response for when AI is not available
    const hasFevertSymptoms = request.symptoms.some(s => 
      s.toLowerCase().includes('fever') || s.toLowerCase().includes('temperature')
    )
    
    const conditions = []
    
    if (hasFevertSymptoms) {
      conditions.push({
        condition: 'Malaria',
        probability: 75,
        reasoning: 'Fever symptoms present, common in endemic areas',
        urgency: 'HIGH' as const
      })
      
      conditions.push({
        condition: 'Typhoid Fever',
        probability: 60,
        reasoning: 'Fever and systemic symptoms suggest possible typhoid',
        urgency: 'HIGH' as const
      })
    }
    
    conditions.push({
      condition: 'Viral Infection',
      probability: 40,
      reasoning: 'Common cause of presented symptoms',
      urgency: 'MEDIUM' as const
    })

    return {
      possibleConditions: conditions,
      recommendations: [
        'Conduct laboratory tests including blood smear for malaria parasites',
        'Consider Widal test for typhoid fever',
        'Monitor vital signs closely',
        'Ensure adequate hydration',
        'Seek immediate medical attention if symptoms worsen'
      ],
      disclaimer: 'This is an AI-generated suggestion and should not replace professional medical diagnosis. Always consult with qualified healthcare professionals.'
    }
  }

  private getMockEducationalContent(request: EducationRequest): EducationResponse {
    const topicLower = request.topic.toLowerCase()
    
    if (topicLower.includes('malaria')) {
      return {
        content: 'Malaria is a life-threatening disease caused by parasites transmitted through infected mosquito bites. Early diagnosis and treatment are crucial for recovery.',
        keyPoints: [
          'Caused by Plasmodium parasites',
          'Transmitted by Anopheles mosquitoes',
          'Symptoms include fever, chills, and flu-like illness',
          'Preventable through mosquito control and prophylaxis',
          'Treatable with antimalarial medications'
        ],
        additionalResources: [
          'WHO Malaria Guidelines',
          'CDC Malaria Prevention',
          'Local Health Department Resources'
        ]
      }
    }
    
    return {
      content: `Educational content about ${request.topic} tailored for ${request.userRole} role.`,
      keyPoints: [
        'Key concept 1',
        'Key concept 2',
        'Key concept 3'
      ],
      additionalResources: [
        'Medical literature',
        'Professional guidelines',
        'Training materials'
      ]
    }
  }
}

export const aiService = new AIService()
export { DiagnosisRequest, DiagnosisResponse, EducationRequest, EducationResponse }
