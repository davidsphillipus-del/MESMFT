console.log('🚀 Testing Node.js...')
console.log('Node version:', process.version)
console.log('Current directory:', process.cwd())

try {
  const express = require('express')
  console.log('✅ Express loaded successfully')
  
  const cors = require('cors')
  console.log('✅ CORS loaded successfully')
  
  const app = express()
  app.use(cors())
  app.use(express.json())
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Test server is working!' })
  })
  
  const PORT = 5001
  app.listen(PORT, () => {
    console.log(`🎉 Test server running on http://localhost:${PORT}`)
    console.log(`📚 Health check: http://localhost:${PORT}/health`)
    console.log('✅ Backend is ready for frontend connection!')
  })
  
} catch (error) {
  console.error('❌ Error starting server:', error.message)
  process.exit(1)
}
