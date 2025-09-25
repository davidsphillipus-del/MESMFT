import { Router } from 'express'
import {
  getPatients,
  getPatientById,
  updatePatient,
  getMedicalRecords,
  addMedicalRecord,
  getVitalSigns,
  addVitalSigns,
  getLabResults,
  addLabResult
} from '@/controllers/patientController'
import { requireRole, requireOwnership } from '@/middleware/auth'
import { body, param, query, validationResult } from 'express-validator'
import { ValidationError } from '@/middleware/errorHandler'

const router = Router()

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
const uuidValidation = param('id').isUUID().withMessage('Invalid patient ID format')

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
]

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           example: "P-2025-0001"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *         bloodType:
 *           type: string
 *           enum: [A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE]
 *         allergies:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *             profile:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 emergencyContact:
 *                   type: string
 *     
 *     MedicalRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           format: uuid
 *         recordType:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         data:
 *           type: object
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     VitalSigns:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           format: uuid
 *         temperature:
 *           type: number
 *           example: 37.2
 *         bloodPressure:
 *           type: string
 *           example: "120/80"
 *         heartRate:
 *           type: integer
 *           example: 72
 *         respiratoryRate:
 *           type: integer
 *           example: 16
 *         oxygenSaturation:
 *           type: number
 *           example: 98.5
 *         weight:
 *           type: number
 *           example: 70.5
 *         height:
 *           type: number
 *           example: 175.0
 *         recordedBy:
 *           type: string
 *           format: uuid
 *         recordedAt:
 *           type: string
 *           format: date-time
 *     
 *     LabResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           format: uuid
 *         testType:
 *           type: string
 *           example: "Blood Test"
 *         testName:
 *           type: string
 *           example: "Complete Blood Count"
 *         results:
 *           type: object
 *         referenceRanges:
 *           type: object
 *         status:
 *           type: string
 *           example: "COMPLETED"
 *         orderedBy:
 *           type: string
 *           format: uuid
 *         performedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/patients:
 *   get:
 *     summary: Get all patients (healthcare providers only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/SortParam'
 *     responses:
 *       200:
 *         description: Patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/',
  requireRole(['DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN']),
  paginationValidation,
  handleValidationErrors,
  getPatients
)

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id',
  uuidValidation,
  handleValidationErrors,
  getPatientById
)

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   put:
 *     summary: Update patient information
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               bloodType:
 *                 type: string
 *                 enum: [A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE]
 *               allergies:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id',
  uuidValidation,
  [
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Valid gender is required'),
    body('bloodType').optional().isIn(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']).withMessage('Valid blood type is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
  ],
  handleValidationErrors,
  updatePatient
)

/**
 * @swagger
 * /api/v1/patients/{id}/medical-records:
 *   get:
 *     summary: Get patient medical records
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by record type
 *     responses:
 *       200:
 *         description: Medical records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/:id/medical-records',
  uuidValidation,
  paginationValidation,
  handleValidationErrors,
  getMedicalRecords
)

/**
 * @swagger
 * /api/v1/patients/{id}/medical-records:
 *   post:
 *     summary: Add medical record (healthcare providers only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recordType
 *               - title
 *             properties:
 *               recordType:
 *                 type: string
 *                 example: "Diagnosis"
 *               title:
 *                 type: string
 *                 example: "Initial Consultation"
 *               description:
 *                 type: string
 *               data:
 *                 type: object
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Medical record added successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/medical-records',
  requireRole(['DOCTOR', 'NURSE', 'PHARMACIST', 'ADMIN']),
  uuidValidation,
  [
    body('recordType').notEmpty().withMessage('Record type is required'),
    body('title').notEmpty().withMessage('Title is required'),
  ],
  handleValidationErrors,
  addMedicalRecord
)

/**
 * @swagger
 * /api/v1/patients/{id}/vital-signs:
 *   get:
 *     summary: Get patient vital signs
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
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
 *         description: Vital signs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/:id/vital-signs',
  uuidValidation,
  paginationValidation,
  [
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  ],
  handleValidationErrors,
  getVitalSigns
)

/**
 * @swagger
 * /api/v1/patients/{id}/vital-signs:
 *   post:
 *     summary: Add vital signs (healthcare providers only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               temperature:
 *                 type: number
 *                 minimum: 30
 *                 maximum: 45
 *               bloodPressure:
 *                 type: string
 *                 pattern: '^\d{2,3}/\d{2,3}$'
 *                 example: "120/80"
 *               heartRate:
 *                 type: integer
 *                 minimum: 30
 *                 maximum: 250
 *               respiratoryRate:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 60
 *               oxygenSaturation:
 *                 type: number
 *                 minimum: 70
 *                 maximum: 100
 *               weight:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 500
 *               height:
 *                 type: number
 *                 minimum: 30
 *                 maximum: 250
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Vital signs recorded successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/vital-signs',
  requireRole(['DOCTOR', 'NURSE', 'ADMIN']),
  uuidValidation,
  [
    body('temperature').optional().isFloat({ min: 30, max: 45 }).withMessage('Temperature must be between 30°C and 45°C'),
    body('heartRate').optional().isInt({ min: 30, max: 250 }).withMessage('Heart rate must be between 30 and 250 BPM'),
    body('respiratoryRate').optional().isInt({ min: 5, max: 60 }).withMessage('Respiratory rate must be between 5 and 60'),
    body('oxygenSaturation').optional().isFloat({ min: 70, max: 100 }).withMessage('Oxygen saturation must be between 70% and 100%'),
    body('weight').optional().isFloat({ min: 0.5, max: 500 }).withMessage('Weight must be between 0.5kg and 500kg'),
    body('height').optional().isFloat({ min: 30, max: 250 }).withMessage('Height must be between 30cm and 250cm'),
    body('bloodPressure').optional().matches(/^\d{2,3}\/\d{2,3}$/).withMessage('Blood pressure must be in format "systolic/diastolic"'),
    body('recordedAt').optional().isISO8601().withMessage('Valid recorded date is required'),
  ],
  handleValidationErrors,
  addVitalSigns
)

/**
 * @swagger
 * /api/v1/patients/{id}/lab-results:
 *   get:
 *     summary: Get patient lab results
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: testType
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by test type
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
 *         description: Lab results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get('/:id/lab-results',
  uuidValidation,
  paginationValidation,
  [
    query('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    query('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  ],
  handleValidationErrors,
  getLabResults
)

/**
 * @swagger
 * /api/v1/patients/{id}/lab-results:
 *   post:
 *     summary: Add lab result (healthcare providers only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testType
 *               - testName
 *               - results
 *             properties:
 *               testType:
 *                 type: string
 *                 example: "Blood Test"
 *               testName:
 *                 type: string
 *                 example: "Complete Blood Count"
 *               results:
 *                 type: object
 *                 example: { "WBC": "7.2", "RBC": "4.5", "Hemoglobin": "14.2" }
 *               referenceRanges:
 *                 type: object
 *                 example: { "WBC": "4.0-11.0", "RBC": "4.2-5.4", "Hemoglobin": "12.0-16.0" }
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *                 default: COMPLETED
 *               performedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Lab result added successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/lab-results',
  requireRole(['DOCTOR', 'NURSE', 'ADMIN']),
  uuidValidation,
  [
    body('testType').notEmpty().withMessage('Test type is required'),
    body('testName').notEmpty().withMessage('Test name is required'),
    body('results').isObject().withMessage('Results must be an object'),
    body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Valid status is required'),
    body('performedAt').optional().isISO8601().withMessage('Valid performed date is required'),
  ],
  handleValidationErrors,
  addLabResult
)

export default router
