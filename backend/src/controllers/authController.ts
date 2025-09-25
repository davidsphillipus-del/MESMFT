import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { DatabaseService } from '@/services/database'
import { RedisService } from '@/services/redis'
import { JWTService } from '@/utils/jwt'
import { logger, logSecurityEvent } from '@/utils/logger'
import { 
  AppError, 
  ValidationError, 
  UnauthorizedError, 
  ConflictError,
  asyncHandler 
} from '@/middleware/errorHandler'
import { validateEmail, validatePassword, validateRole } from '@/utils/validation'

/**
 * User registration
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { 
    email, 
    password, 
    role, 
    firstName, 
    lastName, 
    phone, 
    address,
    dateOfBirth,
    gender,
    bloodType 
  } = req.body

  // Validate required fields
  if (!email || !password || !role || !firstName || !lastName) {
    throw new ValidationError('Missing required fields: email, password, role, firstName, lastName')
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new ValidationError('Invalid email format')
  }

  // Validate password strength
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    throw new ValidationError('Password does not meet requirements', {
      requirements: passwordValidation.requirements,
      errors: passwordValidation.errors
    })
  }

  // Validate role
  if (!validateRole(role)) {
    throw new ValidationError('Invalid role specified')
  }

  const prisma = DatabaseService.getInstance()

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (existingUser) {
    throw new ConflictError('User with this email already exists')
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Generate unique patient ID for patients
  let patientId: string | undefined
  if (role === 'PATIENT') {
    const year = new Date().getFullYear()
    const patientCount = await prisma.patient.count()
    patientId = `P-${year}-${String(patientCount + 1).padStart(4, '0')}`
  }

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      profile: {
        create: {
          firstName,
          lastName,
          phone,
          address,
        }
      },
      ...(role === 'PATIENT' && patientId && {
        patientProfile: {
          create: {
            patientId,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
            gender: gender || 'OTHER',
            bloodType: bloodType || null,
          }
        }
      })
    },
    include: {
      profile: true,
      patientProfile: true,
    }
  })

  // Generate session ID and tokens
  const sessionId = JWTService.generateSessionId()
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId
  }

  const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload)

  // Store session in Redis
  await RedisService.setSession(sessionId, {
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: new Date().toISOString(),
  }, 7 * 24 * 60 * 60) // 7 days

  // Log successful registration
  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      patientProfile: user.patientProfile,
    },
    tokens: {
      accessToken,
      refreshToken,
    }
  })
})

/**
 * User login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  // Validate required fields
  if (!email || !password) {
    throw new ValidationError('Email and password are required')
  }

  const prisma = DatabaseService.getInstance()

  // Find user with profile
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      profile: true,
      patientProfile: true,
    }
  })

  if (!user) {
    logSecurityEvent('Login attempt with non-existent email', { email }, req)
    throw new UnauthorizedError('Invalid email or password')
  }

  if (!user.isActive) {
    logSecurityEvent('Login attempt with inactive account', { userId: user.id, email }, req)
    throw new UnauthorizedError('Account has been deactivated')
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    logSecurityEvent('Login attempt with invalid password', { userId: user.id, email }, req)
    throw new UnauthorizedError('Invalid email or password')
  }

  // Generate session ID and tokens
  const sessionId = JWTService.generateSessionId()
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId
  }

  const { accessToken, refreshToken } = JWTService.generateTokenPair(tokenPayload)

  // Store session in Redis
  await RedisService.setSession(sessionId, {
    userId: user.id,
    email: user.email,
    role: user.role,
    loginAt: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }, 7 * 24 * 60 * 60) // 7 days

  // Store session in database
  await prisma.userSession.create({
    data: {
      userId: user.id,
      token: sessionId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }
  })

  // Log successful login
  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    role: user.role,
    ip: req.ip,
  })

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile || user.patientProfile,
    },
    tokens: {
      accessToken,
      refreshToken,
    }
  })
})

/**
 * User logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user
  if (!user || !user.sessionId) {
    throw new UnauthorizedError('No active session found')
  }

  const prisma = DatabaseService.getInstance()

  // Remove session from Redis
  await RedisService.deleteSession(user.sessionId)

  // Remove session from database
  await prisma.userSession.deleteMany({
    where: {
      userId: user.userId,
      token: user.sessionId,
    }
  })

  logger.info('User logged out successfully', {
    userId: user.userId,
    email: user.email,
  })

  res.json({
    message: 'Logout successful'
  })
})

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new ValidationError('Refresh token is required')
  }

  // Verify refresh token
  const payload = JWTService.verifyRefreshToken(refreshToken)

  // Check if session exists
  const sessionData = await RedisService.getSession(payload.sessionId!)
  if (!sessionData) {
    throw new UnauthorizedError('Session expired')
  }

  // Generate new access token
  const newAccessToken = JWTService.generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId,
  })

  res.json({
    accessToken: newAccessToken,
  })
})

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user
  if (!user) {
    throw new UnauthorizedError('Authentication required')
  }

  const prisma = DatabaseService.getInstance()

  const userProfile = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      profile: true,
      patientProfile: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      profile: true,
      patientProfile: true,
    }
  })

  if (!userProfile) {
    throw new UnauthorizedError('User not found')
  }

  res.json({
    user: userProfile
  })
})
