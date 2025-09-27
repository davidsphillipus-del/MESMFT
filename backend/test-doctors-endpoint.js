const axios = require('axios')

async function testDoctorsEndpoint() {
  try {
    console.log('🔄 Testing doctors endpoint...')
    
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'dr.michael.brown@hospital.com',
      password: 'healthcare123'
    })
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message)
      return
    }
    
    const token = loginResponse.data.data.accessToken
    console.log('✅ Login successful')
    
    // Test doctors endpoint
    const doctorsResponse = await axios.get('http://localhost:5001/api/v1/doctors', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (doctorsResponse.data.success) {
      console.log('✅ Doctors endpoint working!')
      console.log(`📊 Found ${doctorsResponse.data.data.length} doctors:`)
      doctorsResponse.data.data.forEach(doctor => {
        console.log(`   - Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization || 'General'})`)
      })
    } else {
      console.error('❌ Doctors endpoint failed:', doctorsResponse.data.message)
    }
    
    // Test medical records download
    console.log('\n🔄 Testing medical records...')
    const recordsResponse = await axios.get(`http://localhost:5001/api/v1/patients/1/medical-records`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (recordsResponse.data.success) {
      console.log('✅ Medical records endpoint working!')
      console.log(`📊 Found ${recordsResponse.data.data.length} medical records`)
      
      if (recordsResponse.data.data.length > 0) {
        const firstRecord = recordsResponse.data.data[0]
        console.log('\n🔄 Testing download functionality...')
        
        const downloadResponse = await axios.get(`http://localhost:5001/api/v1/medical-records/${firstRecord.id}/download`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (downloadResponse.status === 200) {
          console.log('✅ Download endpoint working!')
          console.log('📄 Sample download content:')
          console.log(downloadResponse.data.substring(0, 200) + '...')
        } else {
          console.error('❌ Download failed')
        }
      }
    } else {
      console.error('❌ Medical records endpoint failed:', recordsResponse.data.message)
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the server first.')
    } else {
      console.error('❌ Test failed:', error.message)
    }
  }
}

testDoctorsEndpoint()
