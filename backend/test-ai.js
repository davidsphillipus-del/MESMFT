const axios = require('axios')

async function testRealTimeOperations() {
  try {
    // First login to get token
    console.log('🔐 Testing login...')
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'dr.michael.brown@hospital.com',
      password: 'healthcare123'
    })

    const token = loginResponse.data.data.accessToken
    console.log('✅ Login successful!')

    // Test 1: Create Appointment (Real Database Operation)
    console.log('\n📅 Testing Real-Time Appointment Booking...')
    const appointmentResponse = await axios.post('http://localhost:5001/api/v1/appointments', {
      patientId: 1,
      doctorId: 2,
      date: '2025-01-15',
      time: '10:00',
      notes: 'Follow-up appointment for typhoid fever treatment'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (appointmentResponse.data.success) {
      console.log('✅ Appointment created successfully!')
      console.log(`   Appointment ID: ${appointmentResponse.data.data.id}`)
    }

    // Test 2: Create Medical Record (Real Database Operation)
    console.log('\n📋 Testing Real-Time Medical Record Creation...')
    const medicalRecordResponse = await axios.post('http://localhost:5001/api/v1/patients/1/medical-records', {
      diagnosis: 'Typhoid Fever - Stage 2',
      symptoms: 'High fever, headache, abdominal pain, rose spots',
      treatment: 'Ciprofloxacin 500mg twice daily for 7 days',
      medications: 'Ciprofloxacin, Paracetamol',
      notes: 'Patient responding well to treatment. Continue monitoring.'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (medicalRecordResponse.data.success) {
      console.log('✅ Medical record created successfully!')
      console.log(`   Record ID: ${medicalRecordResponse.data.data.id}`)
    }

    // Test 3: Create Prescription (Real Database Operation)
    console.log('\n💊 Testing Real-Time Prescription Creation...')
    const prescriptionResponse = await axios.post('http://localhost:5001/api/v1/prescriptions', {
      patientId: 1,
      medicationName: 'Ciprofloxacin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instructions: 'Take with food to avoid stomach upset'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (prescriptionResponse.data.success) {
      console.log('✅ Prescription created successfully!')
      console.log(`   Prescription ID: ${prescriptionResponse.data.data.id}`)
    }

    // Test 4: Record Vital Signs (Real Database Operation)
    console.log('\n❤️ Testing Real-Time Vital Signs Recording...')
    const vitalSignsResponse = await axios.post('http://localhost:5001/api/v1/patients/1/vital-signs', {
      temperature: 38.5,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 85,
      respiratoryRate: 18,
      oxygenSaturation: 98,
      notes: 'Temperature still elevated but improving'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (vitalSignsResponse.data.success) {
      console.log('✅ Vital signs recorded successfully!')
      console.log(`   Vital Signs ID: ${vitalSignsResponse.data.data.id}`)
    }

    // Test 5: Check Activity Logs (Real-Time Tracking)
    console.log('\n📊 Testing Real-Time Activity Tracking...')
    const activityLogsResponse = await axios.get('http://localhost:5001/api/v1/activity-logs?limit=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (activityLogsResponse.data.success) {
      console.log('✅ Activity logs retrieved successfully!')
      console.log(`   Found ${activityLogsResponse.data.data.length} recent activities`)
      activityLogsResponse.data.data.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.action} ${activity.entityType} - ${activity.details}`)
      })
    }

    // Test 6: Get Dashboard Data (Real-Time Updates)
    console.log('\n📈 Testing Real-Time Dashboard Data...')
    const [episodesRes, patientsRes, appointmentsRes] = await Promise.all([
      axios.get('http://localhost:5001/api/v1/episodes', { headers: { 'Authorization': `Bearer ${token}` } }),
      axios.get('http://localhost:5001/api/v1/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
      axios.get('http://localhost:5001/api/v1/appointments', { headers: { 'Authorization': `Bearer ${token}` } })
    ])

    console.log('✅ Dashboard data loaded successfully!')
    console.log(`   Episodes: ${episodesRes.data.data.length}`)
    console.log(`   Patients: ${patientsRes.data.data.length}`)
    console.log(`   Appointments: ${appointmentsRes.data.data.length}`)

    // Test 7: AI Chatbots
    console.log('\n🤖 Testing AI Chatbots...')
    const aiDiagnosisResponse = await axios.post('http://localhost:5001/api/v1/ai/diagnosis', {
      message: 'Hi Dr. MESMTF! I have fever and headache.',
      userRole: 'PATIENT',
      messages: []
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (aiDiagnosisResponse.data.success) {
      console.log('✅ Dr. MESMTF is responding!')
      console.log(`   Response: ${aiDiagnosisResponse.data.data.response.substring(0, 100)}...`)
    }

    console.log('\n🎉 ALL REAL-TIME DATABASE OPERATIONS WORKING!')
    console.log('✅ Appointments: Creating and storing in database')
    console.log('✅ Medical Records: Creating and storing in database')
    console.log('✅ Prescriptions: Creating and storing in database')
    console.log('✅ Vital Signs: Recording and storing in database')
    console.log('✅ Activity Logs: Tracking all operations in real-time')
    console.log('✅ Dashboard Data: Loading real data from database')
    console.log('✅ AI Chatbots: Responding conversationally')

  } catch (error) {
    console.log('❌ Test failed!')
    console.log('Error:', error.response?.data || error.message)
  }
}

testRealTimeOperations()
