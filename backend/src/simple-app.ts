import express from 'express'
import cors from 'cors'

const app = express()

// Simple middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MESMTF Backend API'
  })
})

// Mock users for testing
const mockUsers = [
  { id: '1', email: 'admin1@mesmtf.com', role: 'ADMIN', profile: { firstName: 'System', lastName: 'Administrator' } },
  { id: '2', email: 'admin2@mesmtf.com', role: 'ADMIN', profile: { firstName: 'Sarah', lastName: 'Johnson' } },
  { id: '3', email: 'doctor1@mesmtf.com', role: 'DOCTOR', profile: { firstName: 'Dr. Michael', lastName: 'Smith' } },
  { id: '4', email: 'doctor2@mesmtf.com', role: 'DOCTOR', profile: { firstName: 'Dr. Emily', lastName: 'Davis' } },
  { id: '5', email: 'nurse1@mesmtf.com', role: 'NURSE', profile: { firstName: 'Lisa', lastName: 'Wilson' } },
  { id: '6', email: 'nurse2@mesmtf.com', role: 'NURSE', profile: { firstName: 'Jennifer', lastName: 'Brown' } },
  { id: '7', email: 'receptionist1@mesmtf.com', role: 'RECEPTIONIST', profile: { firstName: 'Maria', lastName: 'Garcia' } },
  { id: '8', email: 'receptionist2@mesmtf.com', role: 'RECEPTIONIST', profile: { firstName: 'Anna', lastName: 'Martinez' } },
  { id: '9', email: 'pharmacist1@mesmtf.com', role: 'PHARMACIST', profile: { firstName: 'Robert', lastName: 'Taylor' } },
  { id: '10', email: 'pharmacist2@mesmtf.com', role: 'PHARMACIST', profile: { firstName: 'Linda', lastName: 'Anderson' } },
  { id: '11', email: 'patient1@mesmtf.com', role: 'PATIENT', profile: { firstName: 'John', lastName: 'Doe' } },
  { id: '12', email: 'patient2@mesmtf.com', role: 'PATIENT', profile: { firstName: 'Jane', lastName: 'Smith' } }
]

// Simple auth endpoint for testing
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body

  // Find user in mock data
  const user = mockUsers.find(u => u.email === email)

  if (!user || password !== 'password123') {
    return res.status(401).json({
      message: 'Invalid credentials',
      success: false
    })
  }

  // Generate simple token
  const token = `token_${user.id}_${Date.now()}`

  return res.json({
    message: 'Login successful',
    success: true,
    data: {
      user,
      accessToken: token,
      refreshToken: `refresh_${token}`
    }
  })
})

// Get current user endpoint
app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'No token provided',
      success: false
    })
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({
      message: 'Invalid token format',
      success: false
    })
  }

  const userId = token.split('_')[1]
  const user = mockUsers.find(u => u.id === userId)

  if (!user) {
    return res.status(401).json({
      message: 'Invalid token',
      success: false
    })
  }

  return res.json({
    message: 'User profile retrieved',
    success: true,
    data: user
  })
})

// Get all users endpoint (for testing)
app.get('/api/v1/users', (req, res) => {
  res.json({
    message: 'Users retrieved successfully',
    success: true,
    data: mockUsers
  })
})

// Logout endpoint
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    message: 'Logout successful',
    success: true
  })
})

export default app
