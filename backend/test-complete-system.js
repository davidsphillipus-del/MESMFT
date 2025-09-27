const axios = require('axios')

async function testCompleteSystem() {
  try {
    console.log('🔐 Testing Complete Healthcare System...\n')
    
    // 1. Test Registration
    console.log('1️⃣ Testing Registration...')
    const newUser = {
      firstName: 'Test',
      lastName: 'Patient',
      email: `test.patient.${Date.now()}@email.com`,
      password: 'healthcare123',
      role: 'PATIENT'
    }
    
    const registerResponse = await axios.post('http://localhost:5001/api/v1/auth/register', newUser)
    console.log(`✅ Registration successful: ${registerResponse.data.data.user.email}`)
    
    // 2. Test Login
    console.log('\n2️⃣ Testing Login...')
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: newUser.email,
      password: newUser.password
    })
    const token = loginResponse.data.data.accessToken
    console.log('✅ Login successful!')
    
    const headers = { 'Authorization': `Bearer ${token}` }
    
    // 3. Test Appointment Creation
    console.log('\n3️⃣ Testing Appointment Creation...')
    const appointmentData = {
      patientId: registerResponse.data.data.user.id,
      doctorId: 2, // Assuming doctor with ID 2 exists
      date: '2025-01-20',
      time: '10:00',
      type: 'Consultation',
      notes: 'Test appointment'
    }
    
    const appointmentResponse = await axios.post('http://localhost:5001/api/v1/appointments', appointmentData, { headers })
    console.log(`✅ Appointment created: ID ${appointmentResponse.data.data.id}`)
    
    // 4. Test Medical Record Creation
    console.log('\n4️⃣ Testing Medical Record Creation...')
    const medicalRecordData = {
      diagnosis: 'Test Diagnosis',
      symptoms: 'Test symptoms',
      treatment: 'Test treatment',
      notes: 'Test medical record'
    }
    
    const medicalRecordResponse = await axios.post(
      `http://localhost:5001/api/v1/patients/${registerResponse.data.data.user.id}/medical-records`, 
      medicalRecordData, 
      { headers }
    )
    console.log(`✅ Medical record created: ID ${medicalRecordResponse.data.data.id}`)
    
    // 5. Test Prescription Creation
    console.log('\n5️⃣ Testing Prescription Creation...')
    const prescriptionData = {
      patientId: registerResponse.data.data.user.id,
      medicationName: 'Test Medication',
      dosage: '10mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instructions: 'Take with food'
    }
    
    const prescriptionResponse = await axios.post('http://localhost:5001/api/v1/prescriptions', prescriptionData, { headers })
    console.log(`✅ Prescription created: ID ${prescriptionResponse.data.data.id}`)
    
    // 6. Test Vital Signs Recording
    console.log('\n6️⃣ Testing Vital Signs Recording...')
    const vitalSignsData = {
      temperature: 98.6,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      notes: 'Normal vital signs'
    }
    
    const vitalSignsResponse = await axios.post(
      `http://localhost:5001/api/v1/patients/${registerResponse.data.data.user.id}/vital-signs`, 
      vitalSignsData, 
      { headers }
    )
    console.log(`✅ Vital signs recorded: ID ${vitalSignsResponse.data.data.id}`)
    
    // 7. Test Data Retrieval
    console.log('\n7️⃣ Testing Data Retrieval...')
    
    // Get appointments
    const appointmentsResponse = await axios.get('http://localhost:5001/api/v1/appointments', { headers })
    console.log(`✅ Retrieved ${appointmentsResponse.data.data.length} appointments`)
    
    // Get medical records
    const recordsResponse = await axios.get(`http://localhost:5001/api/v1/patients/${registerResponse.data.data.user.id}/medical-records`, { headers })
    console.log(`✅ Retrieved ${recordsResponse.data.data.length} medical records`)
    
    // Get prescriptions
    const prescriptionsResponse = await axios.get('http://localhost:5001/api/v1/prescriptions', { headers })
    console.log(`✅ Retrieved ${prescriptionsResponse.data.data.length} prescriptions`)
    
    // Get vital signs
    const vitalsResponse = await axios.get(`http://localhost:5001/api/v1/patients/${registerResponse.data.data.user.id}/vital-signs`, { headers })
    console.log(`✅ Retrieved ${vitalsResponse.data.data.length} vital signs records`)
    
    // 8. Test Activity Logs
    console.log('\n8️⃣ Testing Activity Logs...')
    const activityResponse = await axios.get('http://localhost:5001/api/v1/dashboard/recent-activities', { headers })
    console.log(`✅ Retrieved ${activityResponse.data.data.length} activity logs`)
    
    // 9. Test AI Services
    console.log('\n9️⃣ Testing AI Services...')
    const aiDiagnosisResponse = await axios.post('http://localhost:5001/api/v1/ai/diagnosis', {
      message: 'I have a fever and headache'
    }, { headers })
    console.log('✅ AI Diagnosis service responding')
    
    const aiEducationResponse = await axios.post('http://localhost:5001/api/v1/ai/education', {
      message: 'Tell me about typhoid fever'
    }, { headers })
    console.log('✅ AI Education service responding')
    
    console.log('\n🎉 COMPLETE SYSTEM TEST PASSED!')
    console.log('\n📊 Test Summary:')
    console.log(`   ✅ Registration: Working`)
    console.log(`   ✅ Login: Working`)
    console.log(`   ✅ Appointments: Working (Created ID: ${appointmentResponse.data.data.id})`)
    console.log(`   ✅ Medical Records: Working (Created ID: ${medicalRecordResponse.data.data.id})`)
    console.log(`   ✅ Prescriptions: Working (Created ID: ${prescriptionResponse.data.data.id})`)
    console.log(`   ✅ Vital Signs: Working (Created ID: ${vitalSignsResponse.data.data.id})`)
    console.log(`   ✅ Data Retrieval: Working`)
    console.log(`   ✅ Activity Logging: Working`)
    console.log(`   ✅ AI Services: Working`)
    
    console.log('\n🔐 Test User Created:')
    console.log(`   📧 Email: ${newUser.email}`)
    console.log(`   🔑 Password: ${newUser.password}`)
    console.log(`   👤 Role: ${newUser.role}`)
    
  } catch (error) {
    console.log('❌ Test failed!')
    console.log('Error:', error.response?.data || error.message)
  }
}

testCompleteSystem()
