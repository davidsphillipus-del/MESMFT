import { Router } from 'express'
import { z } from 'zod'
import { databaseService } from '@/services/database'
import { authenticate, requireRole } from '@/middleware/auth'
import { generalRateLimit } from '@/middleware/rateLimiter'
import { asyncHandler, ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler'
import { logger } from '@/utils/logger'

const router = Router()

// Apply authentication and rate limiting
router.use(authenticate)
router.use(generalRateLimit)

// Validation schemas
const createNotificationSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).default('INFO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  actionUrl: z.string().optional(),
})

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
})

/**
 * POST /api/notifications
 * Create a new notification
 * Accessible to: ADMIN, DOCTOR, NURSE, RECEPTIONIST
 */
router.post('/', 
  requireRole(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']), 
  asyncHandler(async (req, res) => {
    const validatedData = createNotificationSchema.parse(req.body)
    
    // Verify recipient exists
    const recipient = await databaseService.prisma.user.findUnique({
      where: { id: validatedData.recipientId }
    })
    
    if (!recipient) {
      throw new NotFoundError('Recipient user')
    }
    
    // Create notification
    const notification = await databaseService.prisma.notification.create({
      data: {
        recipientId: validatedData.recipientId,
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        priority: validatedData.priority,
        actionUrl: validatedData.actionUrl,
        senderId: req.user!.userId,
      },
      include: {
        sender: {
          include: {
            profile: true
          }
        },
        recipient: {
          include: {
            profile: true
          }
        }
      }
    })
    
    logger.info('Notification created successfully', {
      notificationId: notification.id,
      recipientId: notification.recipientId,
      senderId: req.user!.userId,
      type: notification.type,
      priority: notification.priority,
    })
    
    res.status(201).json({
      message: 'Notification created successfully',
      data: notification
    })
  })
)

/**
 * GET /api/notifications
 * Get user's notifications with filtering and pagination
 * Accessible to: All authenticated users (own notifications only)
 */
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)
  const skip = (page - 1) * limit
  
  const isRead = req.query.isRead as string
  const type = req.query.type as string
  const priority = req.query.priority as string
  
  // Build where clause - user can only see their own notifications
  const where: any = {
    recipientId: req.user!.userId
  }
  
  if (isRead !== undefined) {
    where.isRead = isRead === 'true'
  }
  
  if (type) {
    where.type = type
  }
  
  if (priority) {
    where.priority = priority
  }
  
  // Get notifications with pagination
  const [notifications, totalCount, unreadCount] = await Promise.all([
    databaseService.prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          include: {
            profile: true
          }
        }
      }
    }),
    databaseService.prisma.notification.count({ where }),
    databaseService.prisma.notification.count({
      where: {
        recipientId: req.user!.userId,
        isRead: false
      }
    })
  ])
  
  res.json({
    message: 'Notifications retrieved successfully',
    data: {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    }
  })
}))

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 * Accessible to: All authenticated users
 */
router.get('/unread-count', asyncHandler(async (req, res) => {
  const unreadCount = await databaseService.prisma.notification.count({
    where: {
      recipientId: req.user!.userId,
      isRead: false
    }
  })
  
  res.json({
    message: 'Unread count retrieved successfully',
    data: {
      unreadCount
    }
  })
}))

/**
 * GET /api/notifications/:id
 * Get notification by ID
 * Accessible to: All authenticated users (own notifications only)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const notificationId = req.params.id
  
  const notification = await databaseService.prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      sender: {
        include: {
          profile: true
        }
      }
    }
  })
  
  if (!notification) {
    throw new NotFoundError('Notification')
  }
  
  // Users can only access their own notifications
  if (notification.recipientId !== req.user!.userId) {
    throw new ForbiddenError('Access denied to this notification')
  }
  
  res.json({
    message: 'Notification retrieved successfully',
    data: notification
  })
}))

/**
 * PUT /api/notifications/mark-read
 * Mark notifications as read
 * Accessible to: All authenticated users (own notifications only)
 */
router.put('/mark-read', asyncHandler(async (req, res) => {
  const validatedData = markAsReadSchema.parse(req.body)
  
  // Verify all notifications belong to the current user
  const notifications = await databaseService.prisma.notification.findMany({
    where: {
      id: { in: validatedData.notificationIds },
      recipientId: req.user!.userId
    }
  })
  
  if (notifications.length !== validatedData.notificationIds.length) {
    throw new ForbiddenError('Some notifications do not belong to you or do not exist')
  }
  
  // Mark notifications as read
  const updatedNotifications = await databaseService.prisma.notification.updateMany({
    where: {
      id: { in: validatedData.notificationIds },
      recipientId: req.user!.userId
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  })
  
  logger.info('Notifications marked as read', {
    userId: req.user!.userId,
    notificationIds: validatedData.notificationIds,
    count: updatedNotifications.count,
  })
  
  res.json({
    message: 'Notifications marked as read successfully',
    data: {
      updatedCount: updatedNotifications.count
    }
  })
}))

/**
 * PUT /api/notifications/:id/mark-read
 * Mark single notification as read
 * Accessible to: All authenticated users (own notifications only)
 */
router.put('/:id/mark-read', asyncHandler(async (req, res) => {
  const notificationId = req.params.id
  
  // Check if notification exists and belongs to user
  const notification = await databaseService.prisma.notification.findUnique({
    where: { id: notificationId }
  })
  
  if (!notification) {
    throw new NotFoundError('Notification')
  }
  
  if (notification.recipientId !== req.user!.userId) {
    throw new ForbiddenError('Access denied to this notification')
  }
  
  // Mark as read
  const updatedNotification = await databaseService.prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date()
    },
    include: {
      sender: {
        include: {
          profile: true
        }
      }
    }
  })
  
  logger.info('Notification marked as read', {
    notificationId: updatedNotification.id,
    userId: req.user!.userId,
  })
  
  res.json({
    message: 'Notification marked as read successfully',
    data: updatedNotification
  })
}))

/**
 * DELETE /api/notifications/:id
 * Delete notification
 * Accessible to: All authenticated users (own notifications only)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const notificationId = req.params.id
  
  // Check if notification exists and belongs to user
  const notification = await databaseService.prisma.notification.findUnique({
    where: { id: notificationId }
  })
  
  if (!notification) {
    throw new NotFoundError('Notification')
  }
  
  if (notification.recipientId !== req.user!.userId) {
    throw new ForbiddenError('Access denied to this notification')
  }
  
  // Delete notification
  await databaseService.prisma.notification.delete({
    where: { id: notificationId }
  })
  
  logger.info('Notification deleted', {
    notificationId: notificationId,
    userId: req.user!.userId,
  })
  
  res.json({
    message: 'Notification deleted successfully'
  })
}))

/**
 * POST /api/notifications/broadcast
 * Send broadcast notification to multiple users
 * Accessible to: ADMIN only
 */
router.post('/broadcast', 
  requireRole(['ADMIN']), 
  asyncHandler(async (req, res) => {
    const broadcastSchema = z.object({
      recipientIds: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
      title: z.string().min(1, 'Title is required'),
      message: z.string().min(1, 'Message is required'),
      type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).default('INFO'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
      actionUrl: z.string().optional(),
    })
    
    const validatedData = broadcastSchema.parse(req.body)
    
    // Verify all recipients exist
    const recipients = await databaseService.prisma.user.findMany({
      where: { id: { in: validatedData.recipientIds } }
    })
    
    if (recipients.length !== validatedData.recipientIds.length) {
      throw new ValidationError('Some recipient users do not exist')
    }
    
    // Create notifications for all recipients
    const notifications = await databaseService.prisma.notification.createMany({
      data: validatedData.recipientIds.map(recipientId => ({
        recipientId,
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        priority: validatedData.priority,
        actionUrl: validatedData.actionUrl,
        senderId: req.user!.userId,
      }))
    })
    
    logger.info('Broadcast notification sent', {
      senderId: req.user!.userId,
      recipientCount: validatedData.recipientIds.length,
      type: validatedData.type,
      priority: validatedData.priority,
    })
    
    res.status(201).json({
      message: 'Broadcast notification sent successfully',
      data: {
        recipientCount: notifications.count
      }
    })
  })
)

export default router
