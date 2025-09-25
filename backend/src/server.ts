import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Import middleware
import { errorHandler } from '@/middleware/errorHandler'
import { requestLogger } from '@/middleware/requestLogger'
import { rateLimiter } from '@/middleware/rateLimiter'
import { authMiddleware } from '@/middleware/auth'

// Import routes
import authRoutes from '@/routes/auth'
import patientRoutes from '@/routes/patients'
import appointmentRoutes from '@/routes/appointments'
import episodeRoutes from '@/routes/episodes'
import prescriptionRoutes from '@/routes/prescriptions'
import medicationRoutes from '@/routes/medications'
import notificationRoutes from '@/routes/notifications'
import aiRoutes from '@/routes/ai'

// Import services
import { DatabaseService } from '@/services/database'
import { RedisService } from '@/services/redis'
import { logger } from '@/utils/logger'
import { swaggerSetup } from '@/config/swagger'

// Load environment variables
dotenv.config()

class Server {
  private app: express.Application
  private httpServer: any
  private io: SocketIOServer
  private port: number

  constructor() {
    this.app = express()
    this.port = parseInt(process.env.PORT || '5000', 10)
    this.httpServer = createServer(this.app)
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
      }
    })

    this.initializeMiddleware()
    this.initializeRoutes()
    this.initializeErrorHandling()
    this.initializeSocketIO()
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet())
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }))

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Request logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(requestLogger)
    }

    // Rate limiting
    this.app.use(rateLimiter)

    // Swagger documentation (development only)
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SWAGGER === 'true') {
      swaggerSetup(this.app)
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      })
    })

    // API routes
    const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`
    
    this.app.use(`${apiPrefix}/auth`, authRoutes)
    this.app.use(`${apiPrefix}/patients`, patientRoutes)
    this.app.use(`${apiPrefix}/appointments`, appointmentRoutes)
    this.app.use(`${apiPrefix}/episodes`, episodeRoutes)
    this.app.use(`${apiPrefix}/prescriptions`, prescriptionRoutes)
    this.app.use(`${apiPrefix}/medications`, medicationRoutes)
    this.app.use(`${apiPrefix}/notifications`, notificationRoutes)
    this.app.use(`${apiPrefix}/ai`, aiRoutes)

    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The requested route ${req.originalUrl} does not exist`,
        timestamp: new Date().toISOString()
      })
    })
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler)
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`)

      // Join user to their role-based room
      socket.on('join-role-room', (data: { userId: string, role: string }) => {
        socket.join(`role-${data.role}`)
        socket.join(`user-${data.userId}`)
        logger.info(`User ${data.userId} joined role room: ${data.role}`)
      })

      // Handle real-time notifications
      socket.on('send-notification', (data) => {
        if (data.targetRole) {
          socket.to(`role-${data.targetRole}`).emit('notification', data)
        }
        if (data.targetUserId) {
          socket.to(`user-${data.targetUserId}`).emit('notification', data)
        }
      })

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`)
      })
    })
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await DatabaseService.initialize()
      logger.info('Database connection established')

      // Initialize Redis connection
      await RedisService.initialize()
      logger.info('Redis connection established')

      // Start the server
      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 MESMTF Backend Server running on port ${this.port}`)
        logger.info(`📚 Environment: ${process.env.NODE_ENV}`)
        logger.info(`🔗 API Base URL: http://localhost:${this.port}/api/${process.env.API_VERSION || 'v1'}`)
        
        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SWAGGER === 'true') {
          logger.info(`📖 Swagger Documentation: http://localhost:${this.port}/api-docs`)
        }
      })

      // Graceful shutdown handling
      process.on('SIGTERM', this.gracefulShutdown.bind(this))
      process.on('SIGINT', this.gracefulShutdown.bind(this))

    } catch (error) {
      logger.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Received shutdown signal, closing server gracefully...')
    
    this.httpServer.close(async () => {
      try {
        await DatabaseService.disconnect()
        await RedisService.disconnect()
        logger.info('Server closed successfully')
        process.exit(0)
      } catch (error) {
        logger.error('Error during graceful shutdown:', error)
        process.exit(1)
      }
    })
  }
}

// Start the server
const server = new Server()
server.start().catch((error) => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})

export default server
