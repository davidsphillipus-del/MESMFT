import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { logger } from '@/utils/logger'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error implements ApiError {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code || 'INTERNAL_ERROR'
    this.details = details
    this.name = 'AppError'

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * Unauthorized error class
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Forbidden error class
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[]
      return new ConflictError(
        `A record with this ${field?.join(', ') || 'value'} already exists`,
        { field, originalError: error.message }
      )
    
    case 'P2025':
      // Record not found
      return new NotFoundError('Record')
    
    case 'P2003':
      // Foreign key constraint violation
      return new ValidationError(
        'Invalid reference to related record',
        { originalError: error.message }
      )
    
    case 'P2014':
      // Required relation violation
      return new ValidationError(
        'Required relation is missing',
        { originalError: error.message }
      )
    
    case 'P2021':
      // Table does not exist
      return new AppError(
        'Database table does not exist',
        500,
        'DATABASE_ERROR',
        { originalError: error.message }
      )
    
    case 'P2022':
      // Column does not exist
      return new AppError(
        'Database column does not exist',
        500,
        'DATABASE_ERROR',
        { originalError: error.message }
      )
    
    default:
      return new AppError(
        'Database operation failed',
        500,
        'DATABASE_ERROR',
        { code: error.code, originalError: error.message }
      )
  }
}

/**
 * Main error handler middleware
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let appError: AppError

  // Handle different types of errors
  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error)
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError('Invalid data provided', { originalError: error.message })
  } else if (error.name === 'ValidationError') {
    appError = new ValidationError(error.message)
  } else if (error.name === 'CastError') {
    appError = new ValidationError('Invalid ID format')
  } else if (error.name === 'JsonWebTokenError') {
    appError = new UnauthorizedError('Invalid authentication token')
  } else if (error.name === 'TokenExpiredError') {
    appError = new UnauthorizedError('Authentication token expired')
  } else {
    // Generic error
    appError = new AppError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500,
      'INTERNAL_ERROR'
    )
  }

  // Log the error
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: (error as ApiError).code,
      statusCode: appError.statusCode,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: req.user ? {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    } : null,
  }

  if (appError.statusCode >= 500) {
    logger.error('Server Error:', logData)
  } else if (appError.statusCode >= 400) {
    logger.warn('Client Error:', logData)
  }

  // Prepare error response
  const errorResponse: any = {
    error: appError.code || 'ERROR',
    message: appError.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  }

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = appError.details
    errorResponse.stack = error.stack
  }

  // Add validation details if available
  if (appError.details && appError.statusCode === 400) {
    errorResponse.details = appError.details
  }

  res.status(appError.statusCode).json(errorResponse)
}

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`)
  next(error)
}

/**
 * Async error wrapper - catches async errors and passes them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validation error helper
 */
export const createValidationError = (message: string, field?: string, value?: any) => {
  return new ValidationError(message, { field, value })
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
}
