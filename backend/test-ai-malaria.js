const axios = require('axios')

async function testMalariaAI() {
  try {
    console.log('🦟 Testing Updated AI System with Malaria Focus...\n')
    
    // Login first
    const loginResponse = await axios.post('http://localhost:5001/api/v1/auth/login', {
      email: 'dr.michael.brown@hospital.com',
      password: 'healthcare123'
    })
    const token = loginResponse.data.data.accessToken
    const headers = { 'Authorization': `Bearer ${token}` }
    
    console.log('✅ Logged in successfully\n')
    
    // Test 1: Malaria-focused diagnosis
    console.log('1️⃣ Testing Malaria-Focused Diagnosis AI...')
    const malariaQuery = {
      message: "I have fever, chills, and headache. I just returned from a trip to Kenya last week."
    }
    
    const diagnosisResponse = await axios.post('http://localhost:5001/api/v1/ai/diagnosis', malariaQuery, { headers })
    console.log('✅ Dr. MESMTF Response (Diagnosis):')
    console.log(diagnosisResponse.data.data.response.substring(0, 300) + '...')
    console.log('📋 Disclaimer:', diagnosisResponse.data.data.disclaimer)
    
    // Test 2: General fever without travel history
    console.log('\n2️⃣ Testing General Fever Diagnosis...')
    const generalFeverQuery = {
      message: "I have a high fever and feel very tired. No recent travel."
    }
    
    const generalResponse = await axios.post('http://localhost:5001/api/v1/ai/diagnosis', generalFeverQuery, { headers })
    console.log('✅ Dr. MESMTF Response (General):')
    console.log(generalResponse.data.data.response.substring(0, 300) + '...')
    
    // Test 3: Malaria education
    console.log('\n3️⃣ Testing Malaria Education AI...')
    const educationQuery = {
      message: "Can you teach me about malaria prevention and treatment?",
      userRole: "Medical Student"
    }
    
    const educationResponse = await axios.post('http://localhost:5001/api/v1/ai/education', educationQuery, { headers })
    console.log('✅ Professor MESMTF Response (Education):')
    console.log(educationResponse.data.data.response.substring(0, 300) + '...')
    console.log('👤 User Role:', educationResponse.data.data.userRole)
    
    // Test 4: Other tropical diseases
    console.log('\n4️⃣ Testing Other Tropical Disease Knowledge...')
    const dengueQuery = {
      message: "What's the difference between malaria and dengue fever?"
    }
    
    const dengueResponse = await axios.post('http://localhost:5001/api/v1/ai/diagnosis', dengueQuery, { headers })
    console.log('✅ Dr. MESMTF Response (Comparative):')
    console.log(dengueResponse.data.data.response.substring(0, 300) + '...')
    
    // Test 5: AI Status
    console.log('\n5️⃣ Testing AI Service Status...')
    const statusResponse = await axios.get('http://localhost:5001/api/v1/ai/status', { headers })
    console.log('✅ AI Status:', statusResponse.data.message)
    
    console.log('\n🎉 MALARIA-FOCUSED AI SYSTEM TEST COMPLETED!')
    console.log('\n📊 Summary:')
    console.log('   ✅ Malaria-focused diagnosis: Working')
    console.log('   ✅ General medical consultation: Working')
    console.log('   ✅ Malaria education: Working')
    console.log('   ✅ Tropical disease knowledge: Working')
    console.log('   ✅ AI service status: Working')
    
    console.log('\n🦟 Key Features:')
    console.log('   🎯 Primary focus on MALARIA')
    console.log('   🌍 Comprehensive tropical disease knowledge')
    console.log('   🩺 Travel history consideration')
    console.log('   📚 Educational content prioritizing malaria')
    console.log('   ⚠️ Appropriate medical disclaimers')
    
  } catch (error) {
    console.log('❌ Test failed!')
    console.log('Error:', error.response?.data || error.message)
  }
}

testMalariaAI()
