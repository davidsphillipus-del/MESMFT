import { Request, Response, NextFunction } from 'express'
import { JWTService, JWTPayload } from '@/utils/jwt'
import { DatabaseService } from '@/services/database'
import { RedisService } from '@/services/redis'
import { logger, logSecurityEvent } from '@/utils/logger'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & {
        id: string
        profile?: any
      }
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = JWTService.extractTokenFromHeader(authHeader)

    if (!token) {
      logSecurityEvent('Missing authentication token', { url: req.originalUrl }, req)
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No authentication token provided'
      })
    }

    // Verify the token
    const payload = JWTService.verifyAccessToken(token)

    // Check if session exists in Redis (if Redis is available)
    if (payload.sessionId) {
      const sessionExists = await RedisService.exists(`session:${payload.sessionId}`)
      if (!sessionExists) {
        logSecurityEvent('Invalid session', { userId: payload.userId, sessionId: payload.sessionId }, req)
        return res.status(401).json({
          error: 'Session expired',
          message: 'Your session has expired. Please log in again.'
        })
      }
    }

    // Verify user still exists and is active
    const prisma = DatabaseService.getInstance()
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        patientProfile: true
      }
    })

    if (!user || !user.isActive) {
      logSecurityEvent('User not found or inactive', { userId: payload.userId }, req)
      return res.status(401).json({
        error: 'User not found',
        message: 'User account not found or has been deactivated'
      })
    }

    // Attach user info to request
    req.user = {
      ...payload,
      id: user.id,
      profile: user.profile || user.patientProfile
    }

    next()
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        logSecurityEvent('Token expired', { error: error.message }, req)
        return res.status(401).json({
          error: 'Token expired',
          message: 'Your authentication token has expired. Please log in again.'
        })
      } else if (error.message.includes('Invalid')) {
        logSecurityEvent('Invalid token', { error: error.message }, req)
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Invalid authentication token provided'
        })
      }
    }

    logger.error('Authentication middleware error:', error)
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    })
  }
}

/**
 * Role-based authorization middleware
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      })
    }

    if (!roles.includes(req.user.role)) {
      logSecurityEvent('Insufficient permissions', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl
      }, req)
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      })
    }

    next()
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = JWTService.extractTokenFromHeader(authHeader)

    if (!token) {
      return next()
    }

    const payload = JWTService.verifyAccessToken(token)
    
    // Verify user exists
    const prisma = DatabaseService.getInstance()
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        patientProfile: true
      }
    })

    if (user && user.isActive) {
      req.user = {
        ...payload,
        id: user.id,
        profile: user.profile || user.patientProfile
      }
    }

    next()
  } catch (error) {
    // Ignore authentication errors in optional auth
    next()
  }
}

/**
 * Resource ownership middleware - ensures user can only access their own resources
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      })
    }

    const resourceId = req.params[resourceIdParam]
    
    // Admins can access any resource
    if (req.user.role === 'ADMIN') {
      return next()
    }

    // For patients, they can only access their own resources
    if (req.user.role === 'PATIENT') {
      if (resourceId !== req.user.userId) {
        logSecurityEvent('Unauthorized resource access attempt', {
          userId: req.user.userId,
          attemptedResourceId: resourceId,
          url: req.originalUrl
        }, req)
        
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only access your own resources'
        })
      }
    }

    // For healthcare providers, implement additional checks based on assignments
    // This would need to be customized based on your business logic

    next()
  }
}

/**
 * Rate limiting per user
 */
export const userRateLimit = (maxRequests: number = 100, windowMinutes: number = 15) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next()
    }

    const key = `rate_limit:user:${req.user.userId}`
    const windowSeconds = windowMinutes * 60
    
    try {
      const requestCount = await RedisService.incrementRateLimit(key, windowSeconds)
      
      if (requestCount > maxRequests) {
        logSecurityEvent('Rate limit exceeded', {
          userId: req.user.userId,
          requestCount,
          maxRequests,
          windowMinutes
        }, req)
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Maximum ${maxRequests} requests per ${windowMinutes} minutes allowed.`,
          retryAfter: windowSeconds
        })
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - requestCount).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + windowSeconds * 1000).toISOString()
      })

      next()
    } catch (error) {
      logger.error('Rate limiting error:', error)
      next() // Continue on error
    }
  }
}

// Alias for compatibility
export const authenticate = authMiddleware

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required')
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
    }

    next()
  }
}

// Resource ownership middleware
export const requireOwnership = (resourceField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required')
    }

    // This would typically check if the user owns the resource
    // Implementation depends on the specific resource structure
    next()
  }
}

export default authMiddleware
