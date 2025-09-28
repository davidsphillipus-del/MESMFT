// Mock API service to simulate backend functionality

export interface User {
  id: string
  name: string
  email: string
  role: 'patient' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'admin'
  profile: any // Role-specific profile data
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: string
  additionalInfo?: any
}

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: 'P-2025-0001',
    name: 'Nangula K.',
    email: 'nangula@example.com',
    role: 'patient',
    profile: {
      dob: '1996-03-12',
      gender: 'Female',
      contact: 'nangula@example.com',
      phone: '+264-81-234-5678',
      address: 'Klein Windhoek'
    }
  },
  {
    id: 'D-1001',
    name: 'Dr. Asha Mwangi',
    email: 'asha@example.com',
    role: 'doctor',
    profile: {
      specialty: 'Infectious Diseases',
      location: 'Windhoek',
      years: 12,
      contact: 'asha@example.com',
      license: 'NAM-DOC-12345'
    }
  },
  {
    id: 'N-2001',
    name: 'Nurse Tamara Iipinge',
    email: 'tamara@example.com',
    role: 'nurse',
    profile: {
      specialty: 'General Practice',
      location: 'Windhoek',
      years: 8,
      contact: 'tamara@example.com',
      license: 'NAM-NURSE-67890'
    }
  },
  {
    id: 'R-2001',
    name: 'Maria Shilongo',
    email: 'maria@example.com',
    role: 'receptionist',
    profile: {
      department: 'Front Desk',
      location: 'Windhoek Central Clinic',
      shift: 'Day Shift (8:00 - 16:00)',
      contact: 'maria@example.com'
    }
  },
  {
    id: 'PH-2025-001',
    name: 'Pharm. Sarah Nakamhela',
    email: 'sarah@example.com',
    role: 'pharmacist',
    profile: {
      license: 'NAM-PHARM-12345',
      contact: 'sarah.nakamhela@mesmtf.na',
      location: 'Windhoek Central Pharmacy',
      certifications: ['Clinical Pharmacy', 'Antimicrobial Stewardship']
    }
  }
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Authentication API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await delay(1000) // Simulate network delay
    
    const user = MOCK_USERS.find(u => u.email === credentials.email)
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // In a real app, you'd verify the password hash
    if (credentials.password !== 'password123') {
      throw new Error('Invalid password')
    }
    
    return {
      user,
      token: `mock-jwt-token-${user.id}`
    }
  },

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    await delay(1000)
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === data.email)
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    // Create new user
    const newUser: User = {
      id: `${data.role.toUpperCase()}-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role as User['role'],
      profile: data.additionalInfo || {}
    }
    
    MOCK_USERS.push(newUser)
    
    return {
      user: newUser,
      token: `mock-jwt-token-${newUser.id}`
    }
  },

  async logout(): Promise<void> {
    await delay(500)
    // In a real app, you'd invalidate the token on the server
  },

  async getCurrentUser(token: string): Promise<User> {
    await delay(500)
    
    // Extract user ID from token (in a real app, you'd verify the JWT)
    const userId = token.replace('mock-jwt-token-', '')
    const user = MOCK_USERS.find(u => u.id === userId)
    
    if (!user) {
      throw new Error('Invalid token')
    }
    
    return user
  }
}

// Mock data for various entities
export const mockData = {
  // Patients
  patients: [
    { id: "P-2025-0001", name: "Nangula K.", dob: "1996-03-12", contact: "nangula@example.com", phone: "+264-81-234-5678", address: "Klein Windhoek", lastVisit: "2025-09-10" },
    { id: "P-2025-0045", name: "Amos N.", dob: "1982-05-21", contact: "amos@example.com", phone: "+264-85-876-5432", address: "Katutura", lastVisit: "2025-08-15" },
    { id: "P-2025-0089", name: "Helena M.", dob: "1990-11-08", contact: "helena@example.com", phone: "+264-81-555-1234", address: "Pioneers Park", lastVisit: "2025-09-20" }
  ],

  // Doctors
  doctors: [
    { id: 1, name: 'Dr. Asha Mwangi', specialty: 'Infectious Diseases', years: 12, location: 'Windhoek', rating: 4.8, telemedicine: true, languages: ['English','Oshiwambo'], nextAvailable: '2025-10-01T09:00' },
    { id: 2, name: 'Dr. Peter Naude', specialty: 'General Practitioner', years: 5, location: 'Walvis Bay', rating: 4.2, telemedicine: false, languages: ['English','Afrikaans'], nextAvailable: '2025-10-03T14:30' },
    { id: 3, name: 'Dr. L. T. Mensah', specialty: 'Pediatrics', years: 8, location: 'Windhoek', rating: 4.6, telemedicine: true, languages: ['English','French'], nextAvailable: '2025-10-02T11:00' }
  ],

  // Treatment Episodes
  episodes: [
    {
      id: 'T-9001',
      patientName: 'Nangula K.',
      patientId: 'P-2025-0001',
      createdAt: '2025-09-10T08:12',
      status: 'Closed',
      summary: 'Nurse recorded fever, doctor diagnosed malaria, pharmacy dispensed ACT.',
      participants: [
        { role: 'nurse', name: 'Nurse Tamara' },
        { role: 'doctor', name: 'Dr. Asha Mwangi' },
        { role: 'pharmacist', name: 'Pharm. John' },
      ],
      timeline: [
        { who: 'nurse', time: '2025-09-10T08:12', note: 'Vitals recorded: temp 38.9C' },
        { who: 'doctor', time: '2025-09-10T09:05', note: 'Clinical exam + RDT positive. Plan: ACT' },
        { who: 'pharmacy', time: '2025-09-10T10:00', note: 'Dispensed artemether-lumefantrine' },
      ],
    },
    {
      id: 'T-9002',
      patientName: 'Amos N.',
      patientId: 'P-2025-0045',
      createdAt: '2025-08-01T11:00',
      status: 'Open',
      summary: 'Suspected typhoid - send blood culture; nurse to follow up.',
      participants: [
        { role: 'nurse', name: 'Nurse Peter' },
        { role: 'doctor', name: 'Dr. Maria Tshuma' },
      ],
      timeline: [
        { who: 'nurse', time: '2025-08-01T11:00', note: 'Reported abdominal pain, persistent fever' },
        { who: 'doctor', time: '2025-08-01T11:30', note: 'Ordered blood culture and started empirical therapy' },
      ],
    }
  ],

  // Appointments
  appointments: [
    { id: "A-100", patientId: "P-2025-0001", patientName: "Nangula K.", doctorId: "D-1001", doctorName: "Dr. Asha Mwangi", datetime: "2025-09-25T10:30", status: "Confirmed", type: "Follow-up" },
    { id: "A-101", patientId: "P-2025-0045", patientName: "Amos N.", doctorId: "D-1002", doctorName: "Dr. Johannes Hamutenya", datetime: "2025-09-25T14:00", status: "Pending", type: "Consultation" },
    { id: "A-102", patientId: "P-2025-0089", patientName: "Helena M.", doctorId: "D-1001", doctorName: "Dr. Asha Mwangi", datetime: "2025-09-26T09:00", status: "Confirmed", type: "Check-up" }
  ]
}

// Generic API functions
export const api = {
  async get<T>(endpoint: string): Promise<T> {
    await delay(500)
    
    // Simple mock routing
    switch (endpoint) {
      case '/patients':
        return mockData.patients as T
      case '/doctors':
        return mockData.doctors as T
      case '/episodes':
        return mockData.episodes as T
      case '/appointments':
        return mockData.appointments as T
      default:
        throw new Error(`Endpoint ${endpoint} not found`)
    }
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    await delay(800)
    
    // Mock successful creation
    return {
      id: `${endpoint.replace('/', '').toUpperCase()}-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    } as T
  },

  async put<T>(_endpoint: string, data: any): Promise<T> {
    await delay(600)
    
    // Mock successful update
    return {
      ...data,
      updatedAt: new Date().toISOString()
    } as T
  },

  async delete(_endpoint: string): Promise<void> {
    await delay(400)
    // Mock successful deletion
  }
}
