// Diagnosis Bot Service - Scoring utility for medical diagnosis support

export interface Symptom {
  id: string
  name: string
  weight: number // 1-5, higher means more significant
}

export interface Condition {
  id: string
  name: string
  description: string
  symptoms: string[] // symptom IDs
  riskFactors: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface DiagnosisResult {
  condition: Condition
  confidence: number // 0-100
  matchedSymptoms: Symptom[]
  recommendations: string[]
}

export interface DiagnosisResponse {
  results: DiagnosisResult[]
  disclaimer: string
  timestamp: string
}

// Mock symptoms database
const SYMPTOMS: Symptom[] = [
  { id: 'fever', name: 'Fever', weight: 4 },
  { id: 'headache', name: 'Headache', weight: 3 },
  { id: 'nausea', name: 'Nausea', weight: 2 },
  { id: 'vomiting', name: 'Vomiting', weight: 3 },
  { id: 'abdominal_pain', name: 'Abdominal Pain', weight: 3 },
  { id: 'diarrhea', name: 'Diarrhea', weight: 3 },
  { id: 'fatigue', name: 'Fatigue', weight: 2 },
  { id: 'muscle_aches', name: 'Muscle Aches', weight: 2 },
  { id: 'chills', name: 'Chills', weight: 3 },
  { id: 'sweating', name: 'Sweating', weight: 2 },
  { id: 'loss_appetite', name: 'Loss of Appetite', weight: 2 },
  { id: 'joint_pain', name: 'Joint Pain', weight: 2 },
  { id: 'cough', name: 'Cough', weight: 3 },
  { id: 'sore_throat', name: 'Sore Throat', weight: 2 },
  { id: 'runny_nose', name: 'Runny Nose', weight: 1 },
  { id: 'shortness_breath', name: 'Shortness of Breath', weight: 4 },
  { id: 'chest_pain', name: 'Chest Pain', weight: 4 },
  { id: 'rash', name: 'Rash', weight: 3 },
  { id: 'confusion', name: 'Confusion', weight: 5 },
  { id: 'seizures', name: 'Seizures', weight: 5 }
]

// Mock conditions database
const CONDITIONS: Condition[] = [
  {
    id: 'malaria',
    name: 'Malaria',
    description: 'Parasitic infection transmitted by mosquitoes',
    symptoms: ['fever', 'headache', 'chills', 'sweating', 'nausea', 'vomiting', 'fatigue', 'muscle_aches'],
    riskFactors: ['Recent travel to endemic area', 'Mosquito exposure', 'No prophylaxis'],
    urgency: 'high'
  },
  {
    id: 'typhoid',
    name: 'Typhoid Fever',
    description: 'Bacterial infection caused by Salmonella Typhi',
    symptoms: ['fever', 'headache', 'abdominal_pain', 'diarrhea', 'nausea', 'vomiting', 'fatigue', 'loss_appetite'],
    riskFactors: ['Poor sanitation', 'Contaminated food/water', 'Recent travel'],
    urgency: 'high'
  },
  {
    id: 'common_cold',
    name: 'Common Cold',
    description: 'Viral upper respiratory tract infection',
    symptoms: ['runny_nose', 'sore_throat', 'cough', 'headache', 'fatigue'],
    riskFactors: ['Close contact with infected person', 'Seasonal exposure'],
    urgency: 'low'
  },
  {
    id: 'influenza',
    name: 'Influenza',
    description: 'Viral respiratory infection',
    symptoms: ['fever', 'headache', 'muscle_aches', 'fatigue', 'cough', 'sore_throat', 'chills'],
    riskFactors: ['Seasonal outbreak', 'No vaccination', 'Close contact'],
    urgency: 'medium'
  },
  {
    id: 'gastroenteritis',
    name: 'Gastroenteritis',
    description: 'Inflammation of stomach and intestines',
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever', 'fatigue'],
    riskFactors: ['Contaminated food/water', 'Poor hygiene', 'Recent travel'],
    urgency: 'medium'
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    description: 'Infection of the lungs',
    symptoms: ['fever', 'cough', 'shortness_breath', 'chest_pain', 'fatigue', 'chills'],
    riskFactors: ['Age >65 or <2', 'Chronic conditions', 'Smoking', 'Immunocompromised'],
    urgency: 'high'
  },
  {
    id: 'meningitis',
    name: 'Meningitis',
    description: 'Inflammation of brain and spinal cord membranes',
    symptoms: ['fever', 'headache', 'confusion', 'rash', 'nausea', 'vomiting', 'seizures'],
    riskFactors: ['Age <5 or >60', 'Close contact', 'No vaccination'],
    urgency: 'critical'
  }
]

const DISCLAIMER = `
⚠️ IMPORTANT MEDICAL DISCLAIMER:

This diagnostic tool is for educational and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. 

- Always seek the advice of qualified healthcare providers
- Never disregard professional medical advice based on this tool
- In case of emergency, contact emergency services immediately
- This tool cannot account for all medical conditions or individual circumstances
- Results are based on limited symptom matching and should not be considered definitive

If you are experiencing a medical emergency, call emergency services immediately.
`

export const diagnosisService = {
  async analyzeSymptoms(symptomNames: string[]): Promise<DiagnosisResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Find matching symptoms
    const inputSymptoms = SYMPTOMS.filter(s => 
      symptomNames.some(name => 
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase())
      )
    )

    if (inputSymptoms.length === 0) {
      return {
        results: [],
        disclaimer: DISCLAIMER,
        timestamp: new Date().toISOString()
      }
    }

    // Calculate confidence for each condition
    const results: DiagnosisResult[] = CONDITIONS.map(condition => {
      const matchedSymptoms = inputSymptoms.filter(symptom =>
        condition.symptoms.includes(symptom.id)
      )

      if (matchedSymptoms.length === 0) {
        return null
      }

      // Calculate confidence based on:
      // 1. Number of matched symptoms
      // 2. Weight of matched symptoms
      // 3. Percentage of condition symptoms matched
      const totalWeight = matchedSymptoms.reduce((sum, s) => sum + s.weight, 0)
      const maxPossibleWeight = condition.symptoms.reduce((sum, sId) => {
        const symptom = SYMPTOMS.find(s => s.id === sId)
        return sum + (symptom?.weight || 0)
      }, 0)

      const weightRatio = totalWeight / maxPossibleWeight
      const matchRatio = matchedSymptoms.length / condition.symptoms.length
      
      // Confidence calculation (0-100)
      let confidence = Math.round((weightRatio * 0.6 + matchRatio * 0.4) * 100)
      
      // Boost confidence for high-urgency conditions with key symptoms
      if (condition.urgency === 'critical' && confidence > 30) {
        confidence = Math.min(confidence + 20, 95)
      } else if (condition.urgency === 'high' && confidence > 25) {
        confidence = Math.min(confidence + 10, 90)
      }

      // Generate recommendations based on urgency and confidence
      const recommendations = generateRecommendations(condition, confidence)

      return {
        condition,
        confidence,
        matchedSymptoms,
        recommendations
      }
    }).filter(Boolean) as DiagnosisResult[]

    // Sort by confidence (highest first)
    results.sort((a, b) => b.confidence - a.confidence)

    // Return top 5 results
    return {
      results: results.slice(0, 5),
      disclaimer: DISCLAIMER,
      timestamp: new Date().toISOString()
    }
  },

  getAvailableSymptoms(): Symptom[] {
    return SYMPTOMS
  },

  getConditionInfo(conditionId: string): Condition | null {
    return CONDITIONS.find(c => c.id === conditionId) || null
  }
}

function generateRecommendations(condition: Condition, confidence: number): string[] {
  const recommendations: string[] = []

  // Urgency-based recommendations
  if (condition.urgency === 'critical') {
    recommendations.push('🚨 SEEK IMMEDIATE EMERGENCY MEDICAL ATTENTION')
    recommendations.push('Call emergency services or go to the nearest emergency room')
  } else if (condition.urgency === 'high') {
    recommendations.push('⚠️ Seek urgent medical attention within 24 hours')
    recommendations.push('Contact your healthcare provider immediately')
  } else if (condition.urgency === 'medium') {
    recommendations.push('📞 Schedule an appointment with your healthcare provider')
    recommendations.push('Monitor symptoms and seek care if they worsen')
  } else {
    recommendations.push('💡 Consider consulting with a healthcare provider if symptoms persist')
    recommendations.push('Rest and supportive care may be helpful')
  }

  // Confidence-based recommendations
  if (confidence > 70) {
    recommendations.push(`High symptom match for ${condition.name} - professional evaluation recommended`)
  } else if (confidence > 40) {
    recommendations.push(`Moderate symptom match - consider ${condition.name} among other possibilities`)
  } else {
    recommendations.push(`Low symptom match - multiple conditions possible`)
  }

  // Condition-specific recommendations
  if (condition.id === 'malaria') {
    recommendations.push('🔬 Rapid diagnostic test (RDT) or blood smear recommended')
    recommendations.push('Inform healthcare provider of recent travel history')
  } else if (condition.id === 'typhoid') {
    recommendations.push('🧪 Blood culture and Widal test may be needed')
    recommendations.push('Maintain hydration and electrolyte balance')
  } else if (condition.id === 'pneumonia') {
    recommendations.push('📸 Chest X-ray may be required for diagnosis')
    recommendations.push('Monitor oxygen saturation and breathing')
  }

  // General recommendations
  recommendations.push('🌡️ Monitor temperature and vital signs')
  recommendations.push('💧 Maintain adequate hydration')
  recommendations.push('📝 Keep a symptom diary for healthcare provider')

  return recommendations
}
