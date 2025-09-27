const axios = require('axios')

async function testRegistration() {
  try {
    console.log('🔐 Testing New Registration Flow...')
    
    // Test registration
    const response = await axios.post('http://localhost:5001/api/v1/auth/register', {
      firstName: 'New',
      lastName: 'Patient',
      email: `new.patient.${Date.now()}@example.com`,
      password: 'testpass123',
      role: 'PATIENT'
    })
    
    console.log('✅ Registration Response:', response.data)
    
    // Test login with new user
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: response.data.data.user.email,
      password: 'testpass123'
    })
    
    console.log('✅ Login with new user successful!')
    console.log('User data:', loginResponse.data.data.user)
    
  } catch (error) {
    console.log('❌ Test failed!')
    console.log('Error:', error.response?.data || error.message)
  }
}

testRegistration()
