import { UserRole } from '@prisma/client'

/**
 * Email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password validation
 */
export interface PasswordValidation {
  isValid: boolean
  requirements: string[]
  errors: string[]
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = [
    'At least 8 characters long',
    'Contains at least one uppercase letter',
    'Contains at least one lowercase letter',
    'Contains at least one number',
    'Contains at least one special character (!@#$%^&*)',
  ]

  const errors: string[] = []

  // Check length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  // Check uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    requirements,
    errors,
  }
}

/**
 * Role validation
 */
export const validateRole = (role: string): boolean => {
  const validRoles = Object.values(UserRole)
  return validRoles.includes(role as UserRole)
}

/**
 * Phone number validation (international format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Date validation
 */
export const validateDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Age validation (for date of birth)
 */
export const validateAge = (dateOfBirth: string, minAge: number = 0, maxAge: number = 150): boolean => {
  if (!validateDate(dateOfBirth)) return false
  
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge && age - 1 <= maxAge
  }
  
  return age >= minAge && age <= maxAge
}

/**
 * Blood type validation
 */
export const validateBloodType = (bloodType: string): boolean => {
  const validBloodTypes = [
    'A_POSITIVE', 'A_NEGATIVE',
    'B_POSITIVE', 'B_NEGATIVE',
    'AB_POSITIVE', 'AB_NEGATIVE',
    'O_POSITIVE', 'O_NEGATIVE'
  ]
  return validBloodTypes.includes(bloodType)
}

/**
 * Gender validation
 */
export const validateGender = (gender: string): boolean => {
  const validGenders = ['MALE', 'FEMALE', 'OTHER']
  return validGenders.includes(gender)
}

/**
 * UUID validation
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Patient ID validation
 */
export const validatePatientId = (patientId: string): boolean => {
  // Format: P-YYYY-NNNN (e.g., P-2025-0001)
  const patientIdRegex = /^P-\d{4}-\d{4}$/
  return patientIdRegex.test(patientId)
}

/**
 * Medication dosage validation
 */
export const validateDosage = (dosage: string): boolean => {
  // Basic dosage format validation (e.g., "500mg", "2 tablets", "5ml")
  const dosageRegex = /^\d+(\.\d+)?\s*(mg|g|ml|l|tablets?|capsules?|drops?|units?)$/i
  return dosageRegex.test(dosage.trim())
}

/**
 * Vital signs validation
 */
export const validateVitalSigns = (vitals: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Temperature (Celsius)
  if (vitals.temperature !== undefined) {
    if (typeof vitals.temperature !== 'number' || vitals.temperature < 30 || vitals.temperature > 45) {
      errors.push('Temperature must be between 30°C and 45°C')
    }
  }

  // Heart rate (BPM)
  if (vitals.heartRate !== undefined) {
    if (typeof vitals.heartRate !== 'number' || vitals.heartRate < 30 || vitals.heartRate > 250) {
      errors.push('Heart rate must be between 30 and 250 BPM')
    }
  }

  // Respiratory rate (breaths per minute)
  if (vitals.respiratoryRate !== undefined) {
    if (typeof vitals.respiratoryRate !== 'number' || vitals.respiratoryRate < 5 || vitals.respiratoryRate > 60) {
      errors.push('Respiratory rate must be between 5 and 60 breaths per minute')
    }
  }

  // Oxygen saturation (percentage)
  if (vitals.oxygenSaturation !== undefined) {
    if (typeof vitals.oxygenSaturation !== 'number' || vitals.oxygenSaturation < 70 || vitals.oxygenSaturation > 100) {
      errors.push('Oxygen saturation must be between 70% and 100%')
    }
  }

  // Blood pressure (format: "120/80")
  if (vitals.bloodPressure !== undefined) {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/
    if (!bpRegex.test(vitals.bloodPressure)) {
      errors.push('Blood pressure must be in format "systolic/diastolic" (e.g., "120/80")')
    } else {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number)
      if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
        errors.push('Blood pressure values are outside normal ranges')
      }
    }
  }

  // Weight (kg)
  if (vitals.weight !== undefined) {
    if (typeof vitals.weight !== 'number' || vitals.weight < 0.5 || vitals.weight > 500) {
      errors.push('Weight must be between 0.5kg and 500kg')
    }
  }

  // Height (cm)
  if (vitals.height !== undefined) {
    if (typeof vitals.height !== 'number' || vitals.height < 30 || vitals.height > 250) {
      errors.push('Height must be between 30cm and 250cm')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Lab result validation
 */
export const validateLabResult = (result: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!result.testType || typeof result.testType !== 'string') {
    errors.push('Test type is required and must be a string')
  }

  if (!result.testName || typeof result.testName !== 'string') {
    errors.push('Test name is required and must be a string')
  }

  if (!result.results || typeof result.results !== 'object') {
    errors.push('Results are required and must be an object')
  }

  if (result.performedAt && !validateDate(result.performedAt)) {
    errors.push('Performed date must be a valid date')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Appointment validation
 */
export const validateAppointment = (appointment: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!appointment.patientId || !validateUUID(appointment.patientId)) {
    errors.push('Valid patient ID is required')
  }

  if (!appointment.doctorId || !validateUUID(appointment.doctorId)) {
    errors.push('Valid doctor ID is required')
  }

  if (!appointment.scheduledTime || !validateDate(appointment.scheduledTime)) {
    errors.push('Valid scheduled time is required')
  } else {
    const scheduledDate = new Date(appointment.scheduledTime)
    const now = new Date()
    if (scheduledDate <= now) {
      errors.push('Appointment must be scheduled for a future date and time')
    }
  }

  if (appointment.duration && (typeof appointment.duration !== 'number' || appointment.duration < 15 || appointment.duration > 480)) {
    errors.push('Duration must be between 15 and 480 minutes')
  }

  if (!appointment.type || typeof appointment.type !== 'string') {
    errors.push('Appointment type is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize input string
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validate and sanitize user input
 */
export const validateAndSanitizeInput = (input: any, type: 'string' | 'number' | 'email' | 'phone'): any => {
  if (input === null || input === undefined) {
    return input
  }

  switch (type) {
    case 'string':
      return typeof input === 'string' ? sanitizeString(input) : String(input)
    case 'number':
      const num = Number(input)
      return isNaN(num) ? null : num
    case 'email':
      const email = String(input).toLowerCase().trim()
      return validateEmail(email) ? email : null
    case 'phone':
      const phone = String(input).replace(/[\s\-\(\)]/g, '')
      return validatePhoneNumber(phone) ? phone : null
    default:
      return input
  }
}
