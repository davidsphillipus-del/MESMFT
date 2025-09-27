const http = require('http')
const url = require('url')

// Real users with the password "healthcare123"
const realUsers = [
  { id: '1', email: 'dr.michael.brown@hospital.com', password: 'healthcare123', role: 'DOCTOR', profile: { firstName: 'Dr. Michael', lastName: 'Brown', phone: '+1-555-0201' } },
  { id: '2', email: 'dr.emily.davis@hospital.com', password: 'healthcare123', role: 'DOCTOR', profile: { firstName: 'Dr. Emily', lastName: 'Davis', phone: '+1-555-0202' } },
  { id: '3', email: 'lisa.wilson@hospital.com', password: 'healthcare123', role: 'NURSE', profile: { firstName: 'Lisa', lastName: 'Wilson', phone: '+1-555-0301' } },
  { id: '4', email: 'james.taylor@hospital.com', password: 'healthcare123', role: 'NURSE', profile: { firstName: 'James', lastName: 'Taylor', phone: '+1-555-0302' } },
  { id: '5', email: 'maria.garcia@hospital.com', password: 'healthcare123', role: 'RECEPTIONIST', profile: { firstName: 'Maria', lastName: 'Garcia', phone: '+1-555-0401' } },
  { id: '6', email: 'david.martinez@hospital.com', password: 'healthcare123', role: 'RECEPTIONIST', profile: { firstName: 'David', lastName: 'Martinez', phone: '+1-555-0402' } },
  { id: '7', email: 'robert.anderson@pharmacy.com', password: 'healthcare123', role: 'PHARMACIST', profile: { firstName: 'Robert', lastName: 'Anderson', phone: '+1-555-0501' } },
  { id: '8', email: 'jennifer.thomas@pharmacy.com', password: 'healthcare123', role: 'PHARMACIST', profile: { firstName: 'Jennifer', lastName: 'Thomas', phone: '+1-555-0502' } },
  { id: '9', email: 'john.smith@email.com', password: 'healthcare123', role: 'PATIENT', profile: { firstName: 'John', lastName: 'Smith', phone: '+1-555-0101' } },
  { id: '10', email: 'sarah.johnson@email.com', password: 'healthcare123', role: 'PATIENT', profile: { firstName: 'Sarah', lastName: 'Johnson', phone: '+1-555-0102' } },
  { id: '11', email: 'admin.manager@hospital.com', password: 'healthcare123', role: 'ADMIN', profile: { firstName: 'System', lastName: 'Administrator', phone: '+1-555-0601' } },
  { id: '12', email: 'it.support@hospital.com', password: 'healthcare123', role: 'ADMIN', profile: { firstName: 'IT', lastName: 'Support', phone: '+1-555-0602' } }
]

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname
  
  // Parse JSON body for POST requests
  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })
  
  req.on('end', () => {
    let requestData = {}
    if (body) {
      try {
        requestData = JSON.parse(body)
      } catch (e) {
        requestData = {}
      }
    }

    // Health check endpoint
    if (path === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'MESMTF Backend API - Simple Version'
      }))
      return
    }

    // Login endpoint
    if (path === '/api/v1/auth/login' && req.method === 'POST') {
      const { email, password } = requestData
      
      console.log('Login attempt:', { email, password })
      
      // Find user
      const user = realUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!user || user.password !== password) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          message: 'Invalid credentials',
          success: false
        }))
        return
      }
      
      // Generate simple token
      const token = `token_${user.id}_${Date.now()}`
      
      // Remove password from response
      const { password: _, ...userResponse } = user
      
      console.log('Login successful for:', user.email)
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        message: 'Login successful',
        success: true,
        data: {
          user: userResponse,
          accessToken: token,
          refreshToken: `refresh_${token}`
        }
      }))
      return
    }

    // Default 404 response
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Not Found', success: false }))
  })
})

// Start server
const PORT = 5001
server.listen(PORT, () => {
  console.log(`🚀 MESMTF Backend Server running on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/v1/auth/login`)
  console.log(`🎯 Ready for frontend integration!`)
  console.log(``)
  console.log(`👥 Test Users (password: healthcare123):`)
  console.log(`   🩺 dr.michael.brown@hospital.com (Doctor)`)
  console.log(`   👩‍⚕️ lisa.wilson@hospital.com (Nurse)`)
  console.log(`   🏥 maria.garcia@hospital.com (Receptionist)`)
  console.log(`   💊 robert.anderson@pharmacy.com (Pharmacist)`)
  console.log(`   🤒 john.smith@email.com (Patient)`)
  console.log(`   👨‍💼 admin.manager@hospital.com (Admin)`)
})
