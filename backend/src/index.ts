import dotenv from 'dotenv'
import app from './simple-app'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5001

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MESMTF Backend Server running on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/v1/auth/login`)
  console.log(`👥 Users endpoint: http://localhost:${PORT}/api/v1/users`)
  console.log(`🌱 Backend running on: http://localhost:${PORT}`)
  console.log(`🎯 Ready for frontend integration!`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})
