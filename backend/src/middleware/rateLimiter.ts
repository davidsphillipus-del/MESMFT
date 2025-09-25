import { Request, Response, NextFunction } from 'express'
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible'
import { RedisService } from '@/services/redis'
import { logger, logSecurityEvent } from '@/utils/logger'

// Rate limiter instances
let rateLimiter: RateLimiterRedis | RateLimiterMemory

// Initialize rate limiter
const initializeRateLimiter = async () => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)

  try {
    // Try to use Redis if available
    const redisClient = RedisService.getInstance()
    
    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'rl_global',
      points: maxRequests, // Number of requests
      duration: Math.floor(windowMs / 1000), // Per duration in seconds
      blockDuration: Math.floor(windowMs / 1000), // Block for duration in seconds
      execEvenly: true, // Spread requests evenly across duration
    })
    
    logger.info('Rate limiter initialized with Redis')
  } catch (error) {
    // Fallback to memory-based rate limiter
    rateLimiter = new RateLimiterMemory({
      keyPrefix: 'rl_global',
      points: maxRequests,
      duration: Math.floor(windowMs / 1000),
      blockDuration: Math.floor(windowMs / 1000),
      execEvenly: true,
    })
    
    logger.warn('Rate limiter initialized with memory (Redis unavailable)')
  }
}

// Initialize on module load
initializeRateLimiter()

/**
 * General rate limiter middleware
 */
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!rateLimiter) {
      return next()
    }

    // Use IP address as the key, but consider user ID if authenticated
    const key = req.user?.userId || req.ip || 'anonymous'
    
    const result = await rateLimiter.consume(key)
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimiter.points.toString(),
      'X-RateLimit-Remaining': result.remainingPoints?.toString() || '0',
      'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString(),
    })

    next()
  } catch (rejRes: any) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
    
    logSecurityEvent('Rate limit exceeded', {
      key: req.user?.userId || req.ip,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext,
      url: req.originalUrl,
    }, req)

    res.set({
      'X-RateLimit-Limit': rateLimiter.points.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
      'Retry-After': secs.toString(),
    })

    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs,
    })
  }
}

/**
 * Strict rate limiter for sensitive endpoints (login, password reset, etc.)
 */
export const strictRateLimiter = (maxAttempts: number = 5, windowMinutes: number = 15) => {
  let strictLimiter: RateLimiterRedis | RateLimiterMemory

  const initStrictLimiter = async () => {
    const windowSeconds = windowMinutes * 60
    
    try {
      const redisClient = RedisService.getInstance()
      
      strictLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'rl_strict',
        points: maxAttempts,
        duration: windowSeconds,
        blockDuration: windowSeconds * 2, // Block for twice the window
      })
    } catch (error) {
      strictLimiter = new RateLimiterMemory({
        keyPrefix: 'rl_strict',
        points: maxAttempts,
        duration: windowSeconds,
        blockDuration: windowSeconds * 2,
      })
    }
  }

  initStrictLimiter()

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!strictLimiter) {
        return next()
      }

      // Use IP + endpoint for strict limiting
      const key = `${req.ip}:${req.route?.path || req.path}`
      
      const result = await strictLimiter.consume(key)
      
      res.set({
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': result.remainingPoints?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString(),
      })

      next()
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
      
      logSecurityEvent('Strict rate limit exceeded', {
        key: `${req.ip}:${req.route?.path || req.path}`,
        maxAttempts,
        windowMinutes,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext: rejRes.msBeforeNext,
        url: req.originalUrl,
      }, req)

      res.set({
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
        'Retry-After': secs.toString(),
      })

      res.status(429).json({
        error: 'Too Many Attempts',
        message: `Too many attempts. Try again in ${Math.ceil(secs / 60)} minutes.`,
        retryAfter: secs,
      })
    }
  }
}

/**
 * Progressive rate limiter - increases delay with each violation
 */
export const progressiveRateLimiter = (basePoints: number = 10, baseDuration: number = 60) => {
  let progressiveLimiter: RateLimiterRedis | RateLimiterMemory

  const initProgressiveLimiter = async () => {
    try {
      const redisClient = RedisService.getInstance()
      
      progressiveLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'rl_progressive',
        points: basePoints,
        duration: baseDuration,
        blockDuration: baseDuration,
        execEvenly: false,
      })
    } catch (error) {
      progressiveLimiter = new RateLimiterMemory({
        keyPrefix: 'rl_progressive',
        points: basePoints,
        duration: baseDuration,
        blockDuration: baseDuration,
        execEvenly: false,
      })
    }
  }

  initProgressiveLimiter()

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!progressiveLimiter) {
        return next()
      }

      const key = req.ip || 'anonymous'
      
      const result = await progressiveLimiter.consume(key)
      
      res.set({
        'X-RateLimit-Limit': basePoints.toString(),
        'X-RateLimit-Remaining': result.remainingPoints?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString(),
      })

      next()
    } catch (rejRes: any) {
      // Progressive blocking - increase block time with each violation
      const violationCount = rejRes.totalHits - basePoints
      const progressiveDelay = baseDuration * Math.pow(2, Math.min(violationCount, 5)) // Max 32x delay
      const secs = Math.round(progressiveDelay)
      
      logSecurityEvent('Progressive rate limit exceeded', {
        key: req.ip,
        violationCount,
        progressiveDelay,
        url: req.originalUrl,
      }, req)

      res.set({
        'X-RateLimit-Limit': basePoints.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + progressiveDelay * 1000).toISOString(),
        'Retry-After': secs.toString(),
      })

      res.status(429).json({
        error: 'Progressive Rate Limit',
        message: `Rate limit exceeded. Progressive delay applied. Try again in ${secs} seconds.`,
        retryAfter: secs,
      })
    }
  }
}

export default rateLimiter
