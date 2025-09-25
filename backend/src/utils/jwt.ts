import jwt from 'jsonwebtoken'
import { logger } from './logger'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  sessionId?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

class JWTService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

  /**
   * Generate access token
   */
  public static generateAccessToken(payload: JWTPayload): string {
    try {
      return jwt.sign(payload, JWTService.ACCESS_TOKEN_SECRET, {
        expiresIn: JWTService.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'mesmtf-api',
        audience: 'mesmtf-client',
      })
    } catch (error) {
      logger.error('Error generating access token:', error)
      throw new Error('Token generation failed')
    }
  }

  /**
   * Generate refresh token
   */
  public static generateRefreshToken(payload: JWTPayload): string {
    try {
      return jwt.sign(payload, JWTService.REFRESH_TOKEN_SECRET, {
        expiresIn: JWTService.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'mesmtf-api',
        audience: 'mesmtf-client',
      })
    } catch (error) {
      logger.error('Error generating refresh token:', error)
      throw new Error('Token generation failed')
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  public static generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: JWTService.generateAccessToken(payload),
      refreshToken: JWTService.generateRefreshToken(payload),
    }
  }

  /**
   * Verify access token
   */
  public static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWTService.ACCESS_TOKEN_SECRET, {
        issuer: 'mesmtf-api',
        audience: 'mesmtf-client',
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token')
      } else {
        logger.error('Error verifying access token:', error)
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Verify refresh token
   */
  public static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWTService.REFRESH_TOKEN_SECRET, {
        issuer: 'mesmtf-api',
        audience: 'mesmtf-client',
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token')
      } else {
        logger.error('Error verifying refresh token:', error)
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  public static decodeToken(token: string): any {
    try {
      return jwt.decode(token)
    } catch (error) {
      logger.error('Error decoding token:', error)
      return null
    }
  }

  /**
   * Get token expiration time
   */
  public static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000)
      }
      return null
    } catch (error) {
      logger.error('Error getting token expiration:', error)
      return null
    }
  }

  /**
   * Check if token is expired
   */
  public static isTokenExpired(token: string): boolean {
    try {
      const expiration = JWTService.getTokenExpiration(token)
      if (!expiration) return true
      
      return expiration.getTime() < Date.now()
    } catch (error) {
      return true
    }
  }

  /**
   * Extract token from Authorization header
   */
  public static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }
    
    return parts[1]
  }

  /**
   * Generate a secure random session ID
   */
  public static generateSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex')
  }
}

export { JWTService }
