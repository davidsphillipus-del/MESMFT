import winston from 'winston'
import path from 'path'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston that you want to link the colors
winston.addColors(colors)

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

// Define different log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
)

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: logFormat,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: fileLogFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
]

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileLogFormat,
  transports,
  exitOnError: false,
})

// Create logs directory if it doesn't exist
import fs from 'fs'
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Add request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    
    if (res.statusCode >= 400) {
      logger.error(message)
    } else {
      logger.http(message)
    }
  })
  
  next()
}

// Helper functions for structured logging
export const logError = (message: string, error?: any, metadata?: any) => {
  logger.error(message, {
    error: error?.message || error,
    stack: error?.stack,
    ...metadata,
  })
}

export const logInfo = (message: string, metadata?: any) => {
  logger.info(message, metadata)
}

export const logWarn = (message: string, metadata?: any) => {
  logger.warn(message, metadata)
}

export const logDebug = (message: string, metadata?: any) => {
  logger.debug(message, metadata)
}

// Database query logger
export const logDatabaseQuery = (query: string, params?: any, duration?: number) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database Query', {
      query,
      params,
      duration: duration ? `${duration}ms` : undefined,
    })
  }
}

// API request/response logger
export const logApiRequest = (req: any, res: any, responseTime?: number) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
  }

  if (res.statusCode >= 400) {
    logger.error('API Request Failed', logData)
  } else {
    logger.info('API Request', logData)
  }
}

// Security event logger
export const logSecurityEvent = (event: string, details: any, req?: any) => {
  logger.warn('Security Event', {
    event,
    details,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    userId: req?.user?.id,
    timestamp: new Date().toISOString(),
  })
}

// Health check logger
export const logHealthCheck = (service: string, status: 'healthy' | 'unhealthy', details?: any) => {
  const message = `Health Check - ${service}: ${status}`
  
  if (status === 'healthy') {
    logger.info(message, details)
  } else {
    logger.error(message, details)
  }
}

export { logger }
