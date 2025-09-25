import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // Capture original end function
  const originalEnd = res.end
  const originalJson = res.json

  // Override res.end to capture response
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start
    logRequest(req, res, duration)
    return originalEnd.call(this, chunk, encoding)
  }

  // Override res.json to capture JSON responses
  res.json = function(body?: any) {
    const duration = Date.now() - start
    logRequest(req, res, duration, body)
    return originalJson.call(this, body)
  }

  next()
}

/**
 * Log request details
 */
const logRequest = (req: Request, res: Response, duration: number, responseBody?: any) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: res.get('Content-Length'),
    referrer: req.get('Referrer'),
    userId: req.user?.userId,
    userRole: req.user?.role,
    timestamp: new Date().toISOString(),
  }

  // Add request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    logData.requestBody = sanitizeRequestBody(req.body, req.originalUrl)
  }

  // Add query parameters
  if (Object.keys(req.query).length > 0) {
    logData.query = req.query
  }

  // Add response body for errors (in development)
  if (res.statusCode >= 400 && process.env.NODE_ENV === 'development' && responseBody) {
    logData.responseBody = responseBody
  }

  // Log based on status code
  if (res.statusCode >= 500) {
    logger.error('Server Error Request', logData)
  } else if (res.statusCode >= 400) {
    logger.warn('Client Error Request', logData)
  } else if (res.statusCode >= 300) {
    logger.info('Redirect Request', logData)
  } else {
    logger.info('Successful Request', logData)
  }
}

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeRequestBody = (body: any, url: string): any => {
  if (!body || typeof body !== 'object') {
    return body
  }

  const sensitiveFields = [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'privateKey',
    'creditCard',
    'ssn',
    'socialSecurityNumber',
  ]

  const sensitiveUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/auth/change-password',
  ]

  // If it's a sensitive URL, be more aggressive with sanitization
  const isSensitiveUrl = sensitiveUrls.some(sensitiveUrl => url.includes(sensitiveUrl))

  const sanitized = { ...body }

  // Remove sensitive fields
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  })

  // For sensitive URLs, only keep essential fields
  if (isSensitiveUrl) {
    const allowedFields = ['email', 'username', 'role', 'firstName', 'lastName']
    const filteredSanitized = {}
    
    allowedFields.forEach(field => {
      if (sanitized[field]) {
        filteredSanitized[field] = sanitized[field]
      }
    })
    
    return filteredSanitized
  }

  return sanitized
}

/**
 * Performance monitoring middleware
 */
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint()
  
  res.on('finish', () => {
    const end = process.hrtime.bigint()
    const duration = Number(end - start) / 1000000 // Convert to milliseconds
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        userId: req.user?.userId,
        ip: req.ip,
      })
    }
    
    // Log very slow requests (> 5 seconds) as errors
    if (duration > 5000) {
      logger.error('Very Slow Request Detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        userId: req.user?.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      })
    }
  })
  
  next()
}

/**
 * Security event logger middleware
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /eval\(/gi, // Code injection
  ]

  const url = req.originalUrl
  const body = JSON.stringify(req.body)
  const query = JSON.stringify(req.query)

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(url) || pattern.test(body) || pattern.test(query)) {
      logger.warn('Suspicious Request Pattern Detected', {
        pattern: pattern.toString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.userId,
        body: req.body,
        query: req.query,
      })
    }
  })

  next()
}

/**
 * API usage analytics middleware
 */
export const analyticsLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    // Extract endpoint pattern (remove IDs and dynamic parts)
    const endpoint = req.route?.path || req.originalUrl
    const normalizedEndpoint = endpoint.replace(/\/[0-9a-fA-F-]{36}/g, '/:id') // Replace UUIDs
                                      .replace(/\/\d+/g, '/:id') // Replace numeric IDs

    logger.info('API Usage Analytics', {
      endpoint: normalizedEndpoint,
      method: req.method,
      statusCode: res.statusCode,
      userRole: req.user?.role,
      timestamp: new Date().toISOString(),
      responseTime: res.get('X-Response-Time'),
    })
  })

  next()
}

export default requestLogger
