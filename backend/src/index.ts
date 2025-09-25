import dotenv from 'dotenv'
import app from './simple-app'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MESMTF Backend Server running on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/health`)
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/v1/auth/login`)
  console.log(`👥 Users endpoint: http://localhost:${PORT}/api/v1/users`)
  console.log(`🌱 Seed endpoint: http://localhost:${PORT}/api/v1/seed`)
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
