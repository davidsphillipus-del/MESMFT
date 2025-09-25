import { Router } from 'express'
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment
} from '@/controllers/appointmentController'
import { authMiddleware } from '@/middleware/auth'
import { body, param, query, validationResult } from 'express-validator'
import { ValidationError } from '@/middleware/errorHandler'

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

/**
 * Validation middleware
 */
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array())
  }
  next()
}

/**
 * Common validations
 */
const uuidValidation = param('id').isUUID().withMessage('Invalid appointment ID format')

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
]

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           format: uuid
 *         doctorId:
 *           type: string
 *           format: uuid
 *         scheduledTime:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: Duration in minutes
 *           example: 30
 *         type:
 *           type: string
 *           example: "Consultation"
 *         reason:
 *           type: string
 *           example: "Regular checkup"
 *         notes:
 *           type: string
 *         status:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         patient:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *         doctor:
 *           type: object
 *           properties:
 *             profile:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/appointments:
 *   get:
 *     summary: Get appointments
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter by appointment status
 *       - name: doctorId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by doctor ID (healthcare providers only)
 *       - name: patientId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by patient ID (healthcare providers only)
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/',
  paginationValidation,
  [
    query('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).withMessage('Valid status is required'),
    query('doctorId').optional().isUUID().withMessage('Valid doctor ID is required'),
    query('patientId').optional().isUUID().withMessage('Valid patient ID is required'),
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  ],
  handleValidationErrors,
  getAppointments
)

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id',
  uuidValidation,
  handleValidationErrors,
  getAppointmentById
)

/**
 * @swagger
 * /api/v1/appointments:
 *   post:
 *     summary: Create appointment
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - scheduledTime
 *               - type
 *             properties:
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 480
 *                 default: 30
 *               type:
 *                 type: string
 *                 example: "Consultation"
 *               reason:
 *                 type: string
 *                 example: "Regular checkup"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/',
  [
    body('patientId').isUUID().withMessage('Valid patient ID is required'),
    body('doctorId').isUUID().withMessage('Valid doctor ID is required'),
    body('scheduledTime').isISO8601().withMessage('Valid scheduled time is required'),
    body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('type').notEmpty().withMessage('Appointment type is required'),
  ],
  handleValidationErrors,
  createAppointment
)

/**
 * @swagger
 * /api/v1/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 480
 *               type:
 *                 type: string
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id',
  uuidValidation,
  [
    body('scheduledTime').optional().isISO8601().withMessage('Valid scheduled time is required'),
    body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('status').optional().isIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).withMessage('Valid status is required'),
  ],
  handleValidationErrors,
  updateAppointment
)

/**
 * @swagger
 * /api/v1/appointments/{id}/cancel:
 *   post:
 *     summary: Cancel appointment
 *     tags: [Clinical]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post('/:id/cancel',
  uuidValidation,
  handleValidationErrors,
  cancelAppointment
)

export default router
