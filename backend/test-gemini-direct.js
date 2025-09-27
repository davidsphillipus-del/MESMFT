const { GoogleGenerativeAI } = require('@google/generative-ai')

async function testGeminiDirect() {
  try {
    console.log('🤖 Testing Gemini AI Direct Connection...\n')

    const GEMINI_API_KEY = 'AIzaSyDhUWw8YFTECMA1F83PBbRxjiavlTWW3vk'
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

    // First, let's list available models
    console.log('📋 Listing available models...')
    try {
      const models = await genAI.listModels()
      console.log('Available models:')
      models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`)
      })
    } catch (listError) {
      console.log('Could not list models:', listError.message)
    }

    // Try different model names
    const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'models/gemini-pro', 'models/gemini-1.5-flash']

    for (const modelName of modelNames) {
      try {
        console.log(`\n🧪 Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })

        const prompt = `You are Dr. MESMTF, a medical AI assistant specializing in malaria. A patient says: "I have fever and chills after returning from Kenya." Please respond briefly.`

        console.log('📤 Sending prompt...')
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log('✅ Success! Response:')
        console.log(text)
        console.log(`\n🎉 Working model found: ${modelName}`)
        return

      } catch (error) {
        console.log(`❌ Failed with ${modelName}: ${error.message}`)
      }
    }

    console.log('\n❌ No working models found')

  } catch (error) {
    console.log('❌ General Error:')
    console.log('Error:', error.message)
  }
}

testGeminiDirect()
