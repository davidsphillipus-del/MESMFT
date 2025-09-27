import axios from 'axios'

async function testEndpoints() {
  try {
    // First login to get token
    console.log('🔐 Testing login...')
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'dr.michael.brown@hospital.com',
      password: 'healthcare123'
    })
    
    const token = loginResponse.data.data.accessToken
    console.log('✅ Login successful!')
    
    // Test patients endpoint
    console.log('\n👥 Testing patients endpoint...')
    const patientsResponse = await axios.get('http://localhost:5001/api/v1/patients', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`✅ Patients: ${patientsResponse.data.data.length} found`)
    
    // Test episodes endpoint
    console.log('\n🏥 Testing episodes endpoint...')
    const episodesResponse = await axios.get('http://localhost:5001/api/v1/episodes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`✅ Episodes: ${episodesResponse.data.data.length} found`)
    
    // Test appointments endpoint
    console.log('\n📅 Testing appointments endpoint...')
    const appointmentsResponse = await axios.get('http://localhost:5001/api/v1/appointments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`✅ Appointments: ${appointmentsResponse.data.data.length} found`)
    
    // Test medications endpoint
    console.log('\n💊 Testing medications endpoint...')
    const medicationsResponse = await axios.get('http://localhost:5001/api/v1/medications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    console.log(`✅ Medications: ${medicationsResponse.data.data.length} found`)
    
    console.log('\n🎉 All endpoints working correctly!')
    
  } catch (error) {
    console.log('❌ Test failed!')
    console.log('Error:', error.response?.data || error.message)
  }
}

testEndpoints()
