import { createClient, RedisClientType } from 'redis'
import { logger } from '@/utils/logger'

class RedisService {
  private static instance: RedisClientType
  private static isInitialized = false

  public static getInstance(): RedisClientType {
    if (!RedisService.instance) {
      RedisService.instance = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries')
              return new Error('Redis connection failed')
            }
            return Math.min(retries * 50, 1000)
          }
        }
      })

      // Error handling
      RedisService.instance.on('error', (error) => {
        logger.error('Redis error:', error)
      })

      RedisService.instance.on('connect', () => {
        logger.info('Redis client connected')
      })

      RedisService.instance.on('ready', () => {
        logger.info('Redis client ready')
      })

      RedisService.instance.on('end', () => {
        logger.info('Redis client disconnected')
      })
    }

    return RedisService.instance
  }

  public static async initialize(): Promise<void> {
    if (RedisService.isInitialized) {
      return
    }

    try {
      const client = RedisService.getInstance()
      await client.connect()
      
      // Test the connection
      await client.ping()
      
      RedisService.isInitialized = true
      logger.info('Redis connection established successfully')
      
    } catch (error) {
      logger.error('Failed to initialize Redis connection:', error)
      // Redis is optional, so we don't throw an error
      logger.warn('Continuing without Redis cache')
    }
  }

  public static async disconnect(): Promise<void> {
    if (RedisService.instance && RedisService.isInitialized) {
      await RedisService.instance.quit()
      RedisService.isInitialized = false
      logger.info('Redis connection closed')
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      if (!RedisService.isInitialized) {
        return false
      }
      
      const client = RedisService.getInstance()
      const result = await client.ping()
      return result === 'PONG'
    } catch (error) {
      logger.error('Redis health check failed:', error)
      return false
    }
  }

  // Cache operations
  public static async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      if (!RedisService.isInitialized) {
        return
      }

      const client = RedisService.getInstance()
      const serializedValue = JSON.stringify(value)
      
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serializedValue)
      } else {
        await client.set(key, serializedValue)
      }
    } catch (error) {
      logger.error('Redis set error:', error)
    }
  }

  public static async get<T>(key: string): Promise<T | null> {
    try {
      if (!RedisService.isInitialized) {
        return null
      }

      const client = RedisService.getInstance()
      const value = await client.get(key)
      
      if (!value) {
        return null
      }

      return JSON.parse(value) as T
    } catch (error) {
      logger.error('Redis get error:', error)
      return null
    }
  }

  public static async del(key: string): Promise<void> {
    try {
      if (!RedisService.isInitialized) {
        return
      }

      const client = RedisService.getInstance()
      await client.del(key)
    } catch (error) {
      logger.error('Redis delete error:', error)
    }
  }

  public static async exists(key: string): Promise<boolean> {
    try {
      if (!RedisService.isInitialized) {
        return false
      }

      const client = RedisService.getInstance()
      const result = await client.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Redis exists error:', error)
      return false
    }
  }

  public static async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      if (!RedisService.isInitialized) {
        return
      }

      const client = RedisService.getInstance()
      await client.expire(key, ttlSeconds)
    } catch (error) {
      logger.error('Redis expire error:', error)
    }
  }

  // Session management
  public static async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 86400): Promise<void> {
    await RedisService.set(`session:${sessionId}`, sessionData, ttlSeconds)
  }

  public static async getSession<T>(sessionId: string): Promise<T | null> {
    return await RedisService.get<T>(`session:${sessionId}`)
  }

  public static async deleteSession(sessionId: string): Promise<void> {
    await RedisService.del(`session:${sessionId}`)
  }

  // Rate limiting
  public static async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    try {
      if (!RedisService.isInitialized) {
        return 1
      }

      const client = RedisService.getInstance()
      const multi = client.multi()
      
      multi.incr(key)
      multi.expire(key, windowSeconds)
      
      const results = await multi.exec()
      return results?.[0] as number || 1
    } catch (error) {
      logger.error('Redis rate limit error:', error)
      return 1
    }
  }

  // Pub/Sub for real-time notifications
  public static async publish(channel: string, message: any): Promise<void> {
    try {
      if (!RedisService.isInitialized) {
        return
      }

      const client = RedisService.getInstance()
      await client.publish(channel, JSON.stringify(message))
    } catch (error) {
      logger.error('Redis publish error:', error)
    }
  }

  public static async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      if (!RedisService.isInitialized) {
        return
      }

      const subscriber = RedisService.getInstance().duplicate()
      await subscriber.connect()
      
      await subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message)
          callback(parsedMessage)
        } catch (error) {
          logger.error('Redis message parse error:', error)
        }
      })
    } catch (error) {
      logger.error('Redis subscribe error:', error)
    }
  }
}

export { RedisService }
