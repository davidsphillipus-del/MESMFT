const axios = require('axios')

async function testRegistrationFlow() {
  try {
    console.log('🔐 Testing New Registration Flow...\n')
    
    // Test the new simple registration
    const newUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@email.com`,
      password: 'healthcare123',
      role: 'PATIENT'
    }
    
    console.log('1️⃣ Testing Registration with new form...')
    const registerResponse = await axios.post('http://localhost:5001/api/v1/auth/register', newUser)
    console.log(`✅ Registration successful: ${registerResponse.data.data.user.email}`)
    console.log(`   User ID: ${registerResponse.data.data.user.id}`)
    console.log(`   Role: ${registerResponse.data.data.user.role}`)
    
    // Test login with the new user
    console.log('\n2️⃣ Testing Login with new user...')
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: newUser.email,
      password: newUser.password
    })
    console.log('✅ Login successful!')
    console.log(`   Access Token: ${loginResponse.data.data.accessToken.substring(0, 50)}...`)
    
    // Test accessing protected route
    console.log('\n3️⃣ Testing Protected Route Access...')
    const headers = { 'Authorization': `Bearer ${loginResponse.data.data.accessToken}` }
    const meResponse = await axios.get('http://localhost:5001/api/v1/auth/me', { headers })
    console.log('✅ Protected route access successful!')
    console.log(`   User: ${meResponse.data.data.firstName} ${meResponse.data.data.lastName}`)
    console.log(`   Role: ${meResponse.data.data.role}`)
    
    console.log('\n🎉 REGISTRATION FLOW TEST PASSED!')
    console.log('\n📊 Summary:')
    console.log(`   ✅ Registration Form: Working`)
    console.log(`   ✅ User Creation: Working`)
    console.log(`   ✅ Login: Working`)
    console.log(`   ✅ Authentication: Working`)
    console.log(`   ✅ Protected Routes: Working`)
    
    console.log('\n🔐 Test User Created:')
    console.log(`   📧 Email: ${newUser.email}`)
    console.log(`   🔑 Password: ${newUser.password}`)
    console.log(`   👤 Role: ${newUser.role}`)
    console.log(`   🆔 ID: ${registerResponse.data.data.user.id}`)
    
  } catch (error) {
    console.log('❌ Test failed!')
    console.log('Error:', error.response?.data || error.message)
  }
}

testRegistrationFlow()
