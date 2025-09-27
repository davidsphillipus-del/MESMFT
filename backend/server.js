const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const app = express()
const PORT = 5001
const JWT_SECRET = 'mesmtf-healthcare-secret-key-2024'
const dbPath = path.join(__dirname, 'healthcare.db')

// Initialize Gemini AI
const GEMINI_API_KEY = 'AIzaSyDhUWw8YFTECMA1F83PBbRxjiavlTWW3vk'
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Initialize SQLite Database
const db = new sqlite3.Database(dbPath)

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Patients table
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    dateOfBirth TEXT,
    gender TEXT,
    address TEXT,
    emergencyContact TEXT,
    medicalHistory TEXT,
    allergies TEXT,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`)

  // Appointments table
  db.run(`CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER,
    doctorId INTEGER,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES users (id),
    FOREIGN KEY (doctorId) REFERENCES users (id)
  )`)

  // Medical records table
  db.run(`CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientId INTEGER,
    doctorId INTEGER,
    diagnosis TEXT,
    symptoms TEXT,
    treatment TEXT,
    medications TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patientId) REFERENCES users (id),
    FOREIGN KEY (doctorId) REFERENCES users (id)
  )`)

  // Seed initial users
  const users = [
    { email: 'dr.michael.brown@hospital.com', password: 'healthcare123', role: 'DOCTOR', firstName: 'Dr. Michael', lastName: 'Brown', phone: '+1-555-0201' },
    { email: 'dr.emily.davis@hospital.com', password: 'healthcare123', role: 'DOCTOR', firstName: 'Dr. Emily', lastName: 'Davis', phone: '+1-555-0202' },
    { email: 'lisa.wilson@hospital.com', password: 'healthcare123', role: 'NURSE', firstName: 'Lisa', lastName: 'Wilson', phone: '+1-555-0301' },
    { email: 'james.taylor@hospital.com', password: 'healthcare123', role: 'NURSE', firstName: 'James', lastName: 'Taylor', phone: '+1-555-0302' },
    { email: 'maria.garcia@hospital.com', password: 'healthcare123', role: 'RECEPTIONIST', firstName: 'Maria', lastName: 'Garcia', phone: '+1-555-0401' },
    { email: 'david.martinez@hospital.com', password: 'healthcare123', role: 'RECEPTIONIST', firstName: 'David', lastName: 'Martinez', phone: '+1-555-0402' },
    { email: 'robert.anderson@pharmacy.com', password: 'healthcare123', role: 'PHARMACIST', firstName: 'Robert', lastName: 'Anderson', phone: '+1-555-0501' },
    { email: 'jennifer.thomas@pharmacy.com', password: 'healthcare123', role: 'PHARMACIST', firstName: 'Jennifer', lastName: 'Thomas', phone: '+1-555-0502' },
    { email: 'john.smith@email.com', password: 'healthcare123', role: 'PATIENT', firstName: 'John', lastName: 'Smith', phone: '+1-555-0101' },
    { email: 'sarah.johnson@email.com', password: 'healthcare123', role: 'PATIENT', firstName: 'Sarah', lastName: 'Johnson', phone: '+1-555-0102' },
    { email: 'admin.manager@hospital.com', password: 'healthcare123', role: 'ADMIN', firstName: 'System', lastName: 'Administrator', phone: '+1-555-0601' },
    { email: 'it.support@hospital.com', password: 'healthcare123', role: 'ADMIN', firstName: 'IT', lastName: 'Support', phone: '+1-555-0602' }
  ]

  users.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10)
    db.run(`INSERT OR IGNORE INTO users (email, password, role, firstName, lastName, phone) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [user.email, hashedPassword, user.role, user.firstName, user.lastName, user.phone])
  })
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required', success: false })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token', success: false })
    }
    req.user = user
    next()
  })
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MESMTF Healthcare Backend API',
    database: 'Connected'
  })
})

// Login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required', success: false })
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials', success: false })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    const { password: _, ...userResponse } = user

    console.log(`✅ Login successful: ${user.email} (${user.role})`)

    res.json({
      message: 'Login successful',
      success: true,
      data: {
        user: userResponse,
        accessToken: token,
        refreshToken: `refresh_${token}`
      }
    })
  })
})

// Register
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, role, firstName, lastName, phone } = req.body

  if (!email || !password || !role || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required', success: false })
  }

  const validRoles = ['PATIENT', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN']
  if (!validRoles.includes(role.toUpperCase())) {
    return res.status(400).json({ message: 'Invalid role', success: false })
  }

  const hashedPassword = bcrypt.hashSync(password, 10)

  db.run(`INSERT INTO users (email, password, role, firstName, lastName, phone) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [email.toLowerCase(), hashedPassword, role.toUpperCase(), firstName, lastName, phone || ''],
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'User already exists', success: false })
              }
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            const token = jwt.sign(
              { id: this.lastID, email: email.toLowerCase(), role: role.toUpperCase() },
              JWT_SECRET,
              { expiresIn: '24h' }
            )

            console.log(`✅ Registration successful: ${email} (${role})`)

            res.status(201).json({
              message: 'Registration successful',
              success: true,
              data: {
                user: {
                  id: this.lastID,
                  email: email.toLowerCase(),
                  role: role.toUpperCase(),
                  firstName,
                  lastName,
                  phone: phone || ''
                },
                accessToken: token,
                refreshToken: `refresh_${token}`
              }
            })
          })
})

// Get current user
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, role, firstName, lastName, phone, createdAt FROM users WHERE id = ?', 
         [req.user.id], (err, user) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false })
    }

    res.json({
      message: 'User profile retrieved',
      success: true,
      data: user
    })
  })
})

// Get all users (admin only)
app.get('/api/v1/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required', success: false })
  }

  db.all('SELECT id, email, role, firstName, lastName, phone, createdAt FROM users ORDER BY createdAt DESC', 
         (err, users) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Users retrieved successfully',
      success: true,
      data: users
    })
  })
})

// Logout
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful', success: true })
})

// ============================================================================
// EPISODES ENDPOINTS
// ============================================================================

// Get all episodes
app.get('/api/v1/episodes', authenticateToken, (req, res) => {
  const { status, patientId, doctorId } = req.query

  let query = `SELECT e.*,
                      p.firstName as patientFirstName, p.lastName as patientLastName,
                      d.firstName as doctorFirstName, d.lastName as doctorLastName
               FROM episodes e
               LEFT JOIN users p ON e.patientId = p.id
               LEFT JOIN users d ON e.doctorId = d.id
               WHERE 1=1`

  const params = []

  if (status) {
    query += ` AND e.status = ?`
    params.push(status)
  }

  if (patientId) {
    query += ` AND e.patientId = ?`
    params.push(parseInt(patientId))
  }

  if (doctorId) {
    query += ` AND e.doctorId = ?`
    params.push(parseInt(doctorId))
  }

  query += ` ORDER BY e.createdAt DESC`

  db.all(query, params, (err, episodes) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        message: 'Failed to fetch episodes',
        success: false,
        error: err.message
      })
    }

    res.json({
      message: 'Episodes retrieved successfully',
      success: true,
      data: episodes || []
    })
  })
})

// Create new episode
app.post('/api/v1/episodes', authenticateToken, (req, res) => {
  const { patientId, doctorId, title, description, status = 'Open', priority = 'Medium' } = req.body

  if (!patientId || !doctorId || !title) {
    return res.status(400).json({
      message: 'Patient ID, Doctor ID, and title are required',
      success: false
    })
  }

  const newEpisode = {
    id: Date.now(),
    patientId: parseInt(patientId),
    doctorId: parseInt(doctorId),
    title,
    description,
    status,
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  res.status(201).json({
    message: 'Episode created successfully',
    success: true,
    data: newEpisode
  })
})

// ============================================================================
// PATIENTS ENDPOINTS
// ============================================================================

// Get all patients
app.get('/api/v1/patients', authenticateToken, (req, res) => {
  db.all(`SELECT u.id, u.email, u.firstName, u.lastName, u.phone, u.createdAt,
                 p.dateOfBirth, p.gender, p.address, p.emergencyContact, p.medicalHistory, p.allergies
          FROM users u
          LEFT JOIN patients p ON u.id = p.userId
          WHERE u.role = 'PATIENT'
          ORDER BY u.createdAt DESC`, (err, patients) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Patients retrieved successfully',
      success: true,
      data: patients
    })
  })
})

// Get single patient
app.get('/api/v1/patients/:id', authenticateToken, (req, res) => {
  const { id } = req.params

  db.get(`SELECT u.id, u.email, u.firstName, u.lastName, u.phone, u.createdAt,
                 p.dateOfBirth, p.gender, p.address, p.emergencyContact, p.medicalHistory, p.allergies
          FROM users u
          LEFT JOIN patients p ON u.id = p.userId
          WHERE u.id = ? AND u.role = 'PATIENT'`, [id], (err, patient) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found', success: false })
    }

    res.json({
      message: 'Patient retrieved successfully',
      success: true,
      data: patient
    })
  })
})

// Update patient
app.put('/api/v1/patients/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { dateOfBirth, gender, address, emergencyContact, medicalHistory, allergies } = req.body

  // First, check if patient record exists
  db.get('SELECT * FROM patients WHERE userId = ?', [id], (err, existingPatient) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    if (existingPatient) {
      // Update existing patient record
      db.run(`UPDATE patients SET
                dateOfBirth = ?, gender = ?, address = ?, emergencyContact = ?,
                medicalHistory = ?, allergies = ?
              WHERE userId = ?`,
              [dateOfBirth, gender, address, emergencyContact, medicalHistory, allergies, id],
              function(err) {
                if (err) {
                  console.error('Database error:', err)
                  return res.status(500).json({ message: 'Database error', success: false })
                }

                res.json({
                  message: 'Patient updated successfully',
                  success: true
                })
              })
    } else {
      // Create new patient record
      db.run(`INSERT INTO patients (userId, dateOfBirth, gender, address, emergencyContact, medicalHistory, allergies)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [id, dateOfBirth, gender, address, emergencyContact, medicalHistory, allergies],
              function(err) {
                if (err) {
                  console.error('Database error:', err)
                  return res.status(500).json({ message: 'Database error', success: false })
                }

                res.json({
                  message: 'Patient profile created successfully',
                  success: true
                })
              })
    }
  })
})

// ============================================================================
// APPOINTMENTS ENDPOINTS
// ============================================================================

// Get all appointments
app.get('/api/v1/appointments', authenticateToken, (req, res) => {
  const { patientId, doctorId, status } = req.query

  let query = `SELECT a.*,
                      p.firstName as patientFirstName, p.lastName as patientLastName,
                      d.firstName as doctorFirstName, d.lastName as doctorLastName
               FROM appointments a
               LEFT JOIN users p ON a.patientId = p.id
               LEFT JOIN users d ON a.doctorId = d.id
               WHERE 1=1`
  const params = []

  if (patientId) {
    query += ' AND a.patientId = ?'
    params.push(patientId)
  }
  if (doctorId) {
    query += ' AND a.doctorId = ?'
    params.push(doctorId)
  }
  if (status) {
    query += ' AND a.status = ?'
    params.push(status)
  }

  query += ' ORDER BY a.date DESC, a.time DESC'

  db.all(query, params, (err, appointments) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Appointments retrieved successfully',
      success: true,
      data: appointments
    })
  })
})

// Create appointment
app.post('/api/v1/appointments', authenticateToken, (req, res) => {
  const { patientId, doctorId, date, time, notes } = req.body

  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ message: 'Patient ID, Doctor ID, date, and time are required', success: false })
  }

  db.run(`INSERT INTO appointments (patientId, doctorId, date, time, status, notes)
          VALUES (?, ?, ?, ?, 'scheduled', ?)`,
          [patientId, doctorId, date, time, notes || ''],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            const appointmentId = this.lastID

            // Log activity
            logActivity(req.user.id, 'CREATE', 'APPOINTMENT', appointmentId,
                       `Created appointment for patient ${patientId} with doctor ${doctorId} on ${date} at ${time}`)

            res.status(201).json({
              message: 'Appointment created successfully',
              success: true,
              data: { id: appointmentId }
            })
          })
})

// Update appointment
app.put('/api/v1/appointments/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { date, time, status, notes } = req.body

  db.run(`UPDATE appointments SET date = ?, time = ?, status = ?, notes = ?
          WHERE id = ?`,
          [date, time, status, notes, id],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            if (this.changes === 0) {
              return res.status(404).json({ message: 'Appointment not found', success: false })
            }

            res.json({
              message: 'Appointment updated successfully',
              success: true
            })
          })
})

// Cancel appointment
app.post('/api/v1/appointments/:id/cancel', authenticateToken, (req, res) => {
  const { id } = req.params

  db.run('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', id], function(err) {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Appointment not found', success: false })
    }

    res.json({
      message: 'Appointment cancelled successfully',
      success: true
    })
  })
})

// ============================================================================
// MEDICAL RECORDS ENDPOINTS
// ============================================================================

// Get medical records for a patient
app.get('/api/v1/patients/:patientId/medical-records', authenticateToken, (req, res) => {
  const { patientId } = req.params

  db.all(`SELECT mr.*,
                 p.firstName as patientFirstName, p.lastName as patientLastName,
                 d.firstName as doctorFirstName, d.lastName as doctorLastName
          FROM medical_records mr
          LEFT JOIN users p ON mr.patientId = p.id
          LEFT JOIN users d ON mr.doctorId = d.id
          WHERE mr.patientId = ?
          ORDER BY mr.createdAt DESC`, [patientId], (err, records) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Medical records retrieved successfully',
      success: true,
      data: records
    })
  })
})

// Add medical record
app.post('/api/v1/patients/:patientId/medical-records', authenticateToken, (req, res) => {
  const { patientId } = req.params
  const { diagnosis, symptoms, treatment, medications, notes } = req.body
  const doctorId = req.user.id

  db.run(`INSERT INTO medical_records (patientId, doctorId, diagnosis, symptoms, treatment, medications, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [patientId, doctorId, diagnosis, symptoms, treatment, medications, notes],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            const recordId = this.lastID

            // Log activity
            logActivity(doctorId, 'CREATE', 'MEDICAL_RECORD', recordId,
                       `Added medical record for patient ${patientId}: ${diagnosis}`)

            res.status(201).json({
              message: 'Medical record added successfully',
              success: true,
              data: { id: recordId }
            })
          })
})

// Get all medical records (for doctors/nurses)
app.get('/api/v1/medical-records', authenticateToken, (req, res) => {
  const { patientId, doctorId } = req.query

  let query = `SELECT mr.*,
                      p.firstName as patientFirstName, p.lastName as patientLastName,
                      d.firstName as doctorFirstName, d.lastName as doctorLastName
               FROM medical_records mr
               LEFT JOIN users p ON mr.patientId = p.id
               LEFT JOIN users d ON mr.doctorId = d.id
               WHERE 1=1`
  const params = []

  if (patientId) {
    query += ' AND mr.patientId = ?'
    params.push(patientId)
  }
  if (doctorId) {
    query += ' AND mr.doctorId = ?'
    params.push(doctorId)
  }

  query += ' ORDER BY mr.createdAt DESC'

  db.all(query, params, (err, records) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Medical records retrieved successfully',
      success: true,
      data: records
    })
  })
})

// ============================================================================
// EPISODES ENDPOINTS (Treatment Episodes)
// ============================================================================

// Create episodes table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER,
  doctorId INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  startDate TEXT,
  endDate TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users (id),
  FOREIGN KEY (doctorId) REFERENCES users (id)
)`)

// Create activity logs table for real-time tracking
db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId INTEGER,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users (id)
)`)

// Helper function to log activities
function logActivity(userId, action, entityType, entityId, details) {
  db.run(`INSERT INTO activity_logs (userId, action, entityType, entityId, details)
          VALUES (?, ?, ?, ?, ?)`,
          [userId, action, entityType, entityId, details],
          (err) => {
            if (err) console.error('Activity log error:', err)
          })
}

// Insert starting data
function insertStartingData() {
  console.log('🔄 Inserting starting data...')

  // Insert 20 additional users (12 patients, 8 others)
  const newUsers = [
    // 12 Patients
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Carol', lastName: 'Davis', email: 'carol.davis@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'David', lastName: 'Miller', email: 'david.miller@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Frank', lastName: 'Moore', email: 'frank.moore@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Grace', lastName: 'Taylor', email: 'grace.taylor@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Henry', lastName: 'Anderson', email: 'henry.anderson@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Ivy', lastName: 'Thomas', email: 'ivy.thomas@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Jack', lastName: 'Jackson', email: 'jack.jackson@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Kate', lastName: 'White', email: 'kate.white@email.com', password: 'healthcare123', role: 'PATIENT' },
    { firstName: 'Leo', lastName: 'Harris', email: 'leo.harris@email.com', password: 'healthcare123', role: 'PATIENT' },

    // 8 Others (2 doctors, 2 nurses, 2 pharmacists, 1 receptionist, 1 admin)
    { firstName: 'Dr. Sarah', lastName: 'Connor', email: 'dr.sarah.connor@email.com', password: 'healthcare123', role: 'DOCTOR', specialization: 'Internal Medicine' },
    { firstName: 'Dr. James', lastName: 'Bond', email: 'dr.james.bond@email.com', password: 'healthcare123', role: 'DOCTOR', specialization: 'Endocrinology' },
    { firstName: 'Nurse Mary', lastName: 'Poppins', email: 'nurse.mary.poppins@email.com', password: 'healthcare123', role: 'NURSE', department: 'Emergency' },
    { firstName: 'Nurse John', lastName: 'Doe', email: 'nurse.john.doe@email.com', password: 'healthcare123', role: 'NURSE', department: 'ICU' },
    { firstName: 'Pharmacist Anna', lastName: 'Smith', email: 'pharmacist.anna.smith@email.com', password: 'healthcare123', role: 'PHARMACIST', department: 'Pharmacy' },
    { firstName: 'Pharmacist Tom', lastName: 'Brown', email: 'pharmacist.tom.brown@email.com', password: 'healthcare123', role: 'PHARMACIST', department: 'Pharmacy' },
    { firstName: 'Receptionist Lisa', lastName: 'Green', email: 'receptionist.lisa.green@email.com', password: 'healthcare123', role: 'RECEPTIONIST', department: 'Front Desk' },
    { firstName: 'Admin Mike', lastName: 'Admin', email: 'admin.mike.admin@email.com', password: 'healthcare123', role: 'ADMIN' }
  ]

  // bcrypt is already imported at the top

  newUsers.forEach((user) => {
    bcrypt.hash(user.password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password for user:', user.email, err)
        return
      }

      db.run(`INSERT OR IGNORE INTO users (firstName, lastName, email, password, role, specialization, department)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [user.firstName, user.lastName, user.email, hashedPassword, user.role, user.specialization || null, user.department || null],
              function(err) {
                if (err) {
                  console.error('Error inserting user:', err)
                } else if (this.changes > 0) {
                  console.log(`✅ Inserted user: ${user.firstName} ${user.lastName} (${user.role})`)

                  // Create patient profile if user is a patient
                  if (user.role === 'PATIENT') {
                    db.run(`INSERT OR IGNORE INTO patients (userId, dateOfBirth, gender, address, emergencyContact)
                            VALUES (?, ?, ?, ?, ?)`,
                            [this.lastID, '1990-01-01', 'Other', '123 Main St', 'Emergency Contact'],
                            (err) => {
                              if (err) console.error('Error creating patient profile:', err)
                            })
                  }
                }
              })
    })
  })

  // Insert sample episodes
  const episodes = [
    {
      patientId: 1,
      doctorId: 2,
      title: 'Typhoid Fever Treatment',
      description: 'Patient presenting with high fever, headache, and abdominal pain. Diagnosed with typhoid fever.',
      status: 'Open',
      priority: 'High'
    },
    {
      patientId: 3,
      doctorId: 2,
      title: 'Thyroid Function Assessment',
      description: 'Follow-up for thyroid hormone levels and medication adjustment',
      status: 'Open',
      priority: 'Medium'
    },
    {
      patientId: 4,
      doctorId: 2,
      title: 'Completed Typhoid Treatment',
      description: 'Successfully treated typhoid fever with antibiotics',
      status: 'Closed',
      priority: 'Medium'
    }
  ]

  episodes.forEach((episode, index) => {
    db.run(`INSERT OR IGNORE INTO episodes (patientId, doctorId, title, description, status, priority)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [episode.patientId, episode.doctorId, episode.title, episode.description, episode.status, episode.priority],
            function(err) {
              if (err) {
                console.error('Error inserting episode:', err)
              } else if (this.changes > 0) {
                console.log(`✅ Inserted episode: ${episode.title}`)
                logActivity(episode.doctorId, 'CREATE', 'EPISODE', this.lastID, `Created episode: ${episode.title}`)
              }
            })
  })

  // Insert sample appointments
  const appointments = [
    {
      patientId: 1,
      doctorId: 2,
      date: '2025-01-20',
      time: '10:00',
      status: 'scheduled',
      notes: 'Follow-up for typhoid fever treatment'
    },
    {
      patientId: 3,
      doctorId: 2,
      date: '2025-01-22',
      time: '14:30',
      status: 'scheduled',
      notes: 'Thyroid function test results review'
    }
  ]

  appointments.forEach((appointment) => {
    db.run(`INSERT OR IGNORE INTO appointments (patientId, doctorId, date, time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [appointment.patientId, appointment.doctorId, appointment.date, appointment.time, appointment.status, appointment.notes],
            function(err) {
              if (err) {
                console.error('Error inserting appointment:', err)
              } else if (this.changes > 0) {
                console.log(`✅ Inserted appointment for patient ${appointment.patientId}`)
                logActivity(appointment.doctorId, 'CREATE', 'APPOINTMENT', this.lastID,
                           `Created appointment for patient ${appointment.patientId} on ${appointment.date}`)
              }
            })
  })

  // Insert sample medications
  const medications = [
    { name: 'Ciprofloxacin', category: 'Antibiotic', description: 'Used to treat typhoid fever' },
    { name: 'Levothyroxine', category: 'Hormone', description: 'Thyroid hormone replacement therapy' },
    { name: 'Paracetamol', category: 'Analgesic', description: 'Pain relief and fever reduction' },
    { name: 'Azithromycin', category: 'Antibiotic', description: 'Alternative antibiotic for typhoid' }
  ]

  medications.forEach((medication) => {
    db.run(`INSERT OR IGNORE INTO medications (name, category, description)
            VALUES (?, ?, ?)`,
            [medication.name, medication.category, medication.description],
            function(err) {
              if (err) {
                console.error('Error inserting medication:', err)
              } else if (this.changes > 0) {
                console.log(`✅ Inserted medication: ${medication.name}`)
              }
            })
  })

  console.log('✅ Starting data insertion completed!')
}

// Call insertStartingData after database initialization
// setTimeout(insertStartingData, 1000)

// Get all episodes
app.get('/api/v1/episodes', authenticateToken, (req, res) => {
  const { patientId, doctorId, status } = req.query

  let query = `SELECT e.*,
                      p.firstName as patientFirstName, p.lastName as patientLastName,
                      d.firstName as doctorFirstName, d.lastName as doctorLastName
               FROM episodes e
               LEFT JOIN users p ON e.patientId = p.id
               LEFT JOIN users d ON e.doctorId = d.id
               WHERE 1=1`
  const params = []

  if (patientId) {
    query += ' AND e.patientId = ?'
    params.push(patientId)
  }
  if (doctorId) {
    query += ' AND e.doctorId = ?'
    params.push(doctorId)
  }
  if (status) {
    query += ' AND e.status = ?'
    params.push(status)
  }

  query += ' ORDER BY e.createdAt DESC'

  db.all(query, params, (err, episodes) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Episodes retrieved successfully',
      success: true,
      data: episodes
    })
  })
})

// Create episode
app.post('/api/v1/episodes', authenticateToken, (req, res) => {
  const { patientId, title, description, priority, startDate } = req.body
  const doctorId = req.user.id

  if (!patientId || !title) {
    return res.status(400).json({ message: 'Patient ID and title are required', success: false })
  }

  db.run(`INSERT INTO episodes (patientId, doctorId, title, description, priority, startDate, status)
          VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
          [patientId, doctorId, title, description, priority || 'Medium', startDate || new Date().toISOString().split('T')[0]],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            res.status(201).json({
              message: 'Episode created successfully',
              success: true,
              data: { id: this.lastID }
            })
          })
})

// Update episode
app.put('/api/v1/episodes/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { title, description, status, priority, endDate } = req.body

  db.run(`UPDATE episodes SET
            title = ?, description = ?, status = ?, priority = ?, endDate = ?,
            updatedAt = CURRENT_TIMESTAMP
          WHERE id = ?`,
          [title, description, status, priority, endDate, id],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            if (this.changes === 0) {
              return res.status(404).json({ message: 'Episode not found', success: false })
            }

            res.json({
              message: 'Episode updated successfully',
              success: true
            })
          })
})

// ============================================================================
// PRESCRIPTIONS ENDPOINTS
// ============================================================================

// Create prescriptions table
db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER,
  doctorId INTEGER,
  medicationName TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'pending',
  prescribedDate TEXT,
  dispensedDate TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users (id),
  FOREIGN KEY (doctorId) REFERENCES users (id)
)`)

// Get prescriptions
app.get('/api/v1/prescriptions', authenticateToken, (req, res) => {
  const { patientId, doctorId, status } = req.query

  let query = `SELECT pr.*,
                      p.firstName as patientFirstName, p.lastName as patientLastName,
                      d.firstName as doctorFirstName, d.lastName as doctorLastName
               FROM prescriptions pr
               LEFT JOIN users p ON pr.patientId = p.id
               LEFT JOIN users d ON pr.doctorId = d.id
               WHERE 1=1`
  const params = []

  if (patientId) {
    query += ' AND pr.patientId = ?'
    params.push(patientId)
  }
  if (doctorId) {
    query += ' AND pr.doctorId = ?'
    params.push(doctorId)
  }
  if (status) {
    query += ' AND pr.status = ?'
    params.push(status)
  }

  query += ' ORDER BY pr.createdAt DESC'

  db.all(query, params, (err, prescriptions) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Prescriptions retrieved successfully',
      success: true,
      data: prescriptions
    })
  })
})

// Create prescription
app.post('/api/v1/prescriptions', authenticateToken, (req, res) => {
  const { patientId, medicationName, dosage, frequency, duration, instructions } = req.body
  const doctorId = req.user.id

  if (!patientId || !medicationName || !dosage || !frequency) {
    return res.status(400).json({
      message: 'Patient ID, medication name, dosage, and frequency are required',
      success: false
    })
  }

  db.run(`INSERT INTO prescriptions (patientId, doctorId, medicationName, dosage, frequency, duration, instructions, prescribedDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [patientId, doctorId, medicationName, dosage, frequency, duration, instructions, new Date().toISOString().split('T')[0]],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            res.status(201).json({
              message: 'Prescription created successfully',
              success: true,
              data: { id: this.lastID }
            })
          })
})

// Dispense prescription
app.post('/api/v1/prescriptions/:id/dispense', authenticateToken, (req, res) => {
  const { id } = req.params

  db.run(`UPDATE prescriptions SET status = 'dispensed', dispensedDate = ? WHERE id = ?`,
          [new Date().toISOString().split('T')[0], id],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            if (this.changes === 0) {
              return res.status(404).json({ message: 'Prescription not found', success: false })
            }

            res.json({
              message: 'Prescription dispensed successfully',
              success: true
            })
          })
})

// ============================================================================
// MEDICATIONS ENDPOINTS
// ============================================================================

// Create medications table
db.run(`CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  genericName TEXT,
  category TEXT,
  description TEXT,
  sideEffects TEXT,
  contraindications TEXT,
  dosageForm TEXT,
  strength TEXT,
  manufacturer TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`)

// Seed some common medications
db.run(`INSERT OR IGNORE INTO medications (name, genericName, category, description, dosageForm, strength) VALUES
  ('Paracetamol', 'Acetaminophen', 'Analgesic', 'Pain reliever and fever reducer', 'Tablet', '500mg'),
  ('Ibuprofen', 'Ibuprofen', 'NSAID', 'Anti-inflammatory pain reliever', 'Tablet', '400mg'),
  ('Amoxicillin', 'Amoxicillin', 'Antibiotic', 'Penicillin antibiotic', 'Capsule', '250mg'),
  ('Metformin', 'Metformin', 'Antidiabetic', 'Type 2 diabetes medication', 'Tablet', '500mg'),
  ('Lisinopril', 'Lisinopril', 'ACE Inhibitor', 'Blood pressure medication', 'Tablet', '10mg')`)

// Get medications
app.get('/api/v1/medications', authenticateToken, (req, res) => {
  const { search, category } = req.query

  let query = 'SELECT * FROM medications WHERE 1=1'
  const params = []

  if (search) {
    query += ' AND (name LIKE ? OR genericName LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }
  if (category) {
    query += ' AND category = ?'
    params.push(category)
  }

  query += ' ORDER BY name'

  db.all(query, params, (err, medications) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Medications retrieved successfully',
      success: true,
      data: medications
    })
  })
})

// Search medications
app.get('/api/v1/medications/search/:query', authenticateToken, (req, res) => {
  const { query } = req.params

  db.all(`SELECT * FROM medications
          WHERE name LIKE ? OR genericName LIKE ? OR category LIKE ?
          ORDER BY name LIMIT 20`,
          [`%${query}%`, `%${query}%`, `%${query}%`], (err, medications) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Medication search completed',
      success: true,
      data: medications
    })
  })
})

// ============================================================================
// VITAL SIGNS ENDPOINTS
// ============================================================================

// Create vital signs table
db.run(`CREATE TABLE IF NOT EXISTS vital_signs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER,
  recordedBy INTEGER,
  temperature REAL,
  bloodPressureSystolic INTEGER,
  bloodPressureDiastolic INTEGER,
  heartRate INTEGER,
  respiratoryRate INTEGER,
  oxygenSaturation REAL,
  weight REAL,
  height REAL,
  notes TEXT,
  recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES users (id),
  FOREIGN KEY (recordedBy) REFERENCES users (id)
)`)

// Get vital signs for a patient
app.get('/api/v1/patients/:patientId/vital-signs', authenticateToken, (req, res) => {
  const { patientId } = req.params

  db.all(`SELECT vs.*,
                 u.firstName as recordedByFirstName, u.lastName as recordedByLastName
          FROM vital_signs vs
          LEFT JOIN users u ON vs.recordedBy = u.id
          WHERE vs.patientId = ?
          ORDER BY vs.recordedAt DESC`, [patientId], (err, vitalSigns) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Vital signs retrieved successfully',
      success: true,
      data: vitalSigns
    })
  })
})

// Add vital signs
app.post('/api/v1/patients/:patientId/vital-signs', authenticateToken, (req, res) => {
  const { patientId } = req.params
  const { temperature, bloodPressureSystolic, bloodPressureDiastolic, heartRate, respiratoryRate, oxygenSaturation, weight, height, notes } = req.body
  const recordedBy = req.user.id

  db.run(`INSERT INTO vital_signs (patientId, recordedBy, temperature, bloodPressureSystolic, bloodPressureDiastolic, heartRate, respiratoryRate, oxygenSaturation, weight, height, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [patientId, recordedBy, temperature, bloodPressureSystolic, bloodPressureDiastolic, heartRate, respiratoryRate, oxygenSaturation, weight, height, notes],
          function(err) {
            if (err) {
              console.error('Database error:', err)
              return res.status(500).json({ message: 'Database error', success: false })
            }

            res.status(201).json({
              message: 'Vital signs recorded successfully',
              success: true,
              data: { id: this.lastID }
            })
          })
})

// ============================================================================
// NOTIFICATIONS ENDPOINTS
// ============================================================================

// Create notifications table
db.run(`CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  isRead INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users (id)
)`)

// Get notifications for user
app.get('/api/v1/notifications', authenticateToken, (req, res) => {
  const userId = req.user.id
  const { unreadOnly } = req.query

  let query = 'SELECT * FROM notifications WHERE userId = ?'
  const params = [userId]

  if (unreadOnly === 'true') {
    query += ' AND isRead = 0'
  }

  query += ' ORDER BY createdAt DESC'

  db.all(query, params, (err, notifications) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Notifications retrieved successfully',
      success: true,
      data: notifications
    })
  })
})

// Get unread count
app.get('/api/v1/notifications/unread-count', authenticateToken, (req, res) => {
  const userId = req.user.id

  db.get('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0', [userId], (err, result) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Unread count retrieved successfully',
      success: true,
      data: { count: result.count }
    })
  })
})

// Mark notification as read
app.put('/api/v1/notifications/:id/mark-read', authenticateToken, (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  db.run('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', [id, userId], function(err) {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ message: 'Database error', success: false })
    }

    res.json({
      message: 'Notification marked as read',
      success: true
    })
  })
})

// ============================================================================
// AI ENDPOINTS (Mock Implementation)
// ============================================================================

// AI Diagnosis Chat
app.post('/api/v1/ai/diagnosis', authenticateToken, async (req, res) => {
  const { message, messages } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" })

    // Create conversational diagnosis prompt
    const diagnosisPrompt = `You are Dr. MESMTF, a highly knowledgeable and friendly medical AI assistant with comprehensive expertise in tropical and infectious diseases. You chat naturally like ChatGPT and can help with various medical conditions, with special focus on MALARIA diagnosis and treatment.

🩺 YOUR PRIMARY EXPERTISE (PRIORITY FOCUS):
1. **MALARIA** - All types and comprehensive management
2. **TYPHOID FEVER** - Salmonella Typhi infections
3. **THYROID DISORDERS** - Complete thyroid health
4. **OTHER TROPICAL/INFECTIOUS DISEASES** - Dengue, chikungunya, yellow fever, etc.

🦟 MALARIA EXPERTISE (PRIMARY FOCUS):
🔹 **TYPES**: P. falciparum (most dangerous), P. vivax, P. ovale, P. malariae, P. knowlesi
🔹 **SYMPTOMS**: Fever (cyclical/continuous), chills, sweats, headache, muscle aches, fatigue, nausea, vomiting, diarrhea
🔹 **SEVERE MALARIA**: Cerebral malaria, severe anemia, respiratory distress, kidney failure, hypoglycemia, shock
🔹 **DIAGNOSIS**: Rapid diagnostic tests (RDT), microscopy, PCR, travel history crucial
🔹 **TREATMENT**: Artemisinin-based combination therapy (ACT), severe cases need IV artesunate
🔹 **PREVENTION**: Bed nets, antimalarial prophylaxis, vector control, early diagnosis
🔹 **COMPLICATIONS**: Can be fatal if untreated, especially P. falciparum

✅ TYPHOID FEVER KNOWLEDGE:
🔹 **SYMPTOMS**: High stepwise fever, headache, abdominal pain, rose spots, constipation/diarrhea
🔹 **DIAGNOSIS**: Blood culture, stool test, travel to endemic areas
🔹 **TREATMENT**: Antibiotics (Ciprofloxacin, Ceftriaxone, Azithromycin)

✅ THYROID DISEASE KNOWLEDGE:
🔹 **HYPOTHYROIDISM**: Fatigue, weight gain, cold sensitivity, slow heart rate
🔹 **HYPERTHYROIDISM**: Weight loss, heat sensitivity, rapid heartbeat, anxiety
🔹 **DIAGNOSIS**: TSH, T3, T4 blood tests
🔹 **TREATMENT**: Levothyroxine (hypo), Methimazole (hyper)

🎯 DIAGNOSTIC APPROACH:
1. **ALWAYS consider malaria first** for fever cases, especially with travel history
2. Ask about travel to malaria-endemic areas (Africa, Asia, South America)
3. Inquire about timing of symptoms and fever patterns
4. Consider seasonal factors and geographic risk
5. Assess severity and need for urgent care
6. Provide differential diagnosis including other tropical diseases

💬 CONVERSATION STYLE:
- Chat naturally and conversationally like ChatGPT
- Be empathetic and understanding
- **Prioritize malaria screening** for fever/flu-like symptoms
- Ask targeted questions about travel, geography, and exposure
- Provide detailed explanations and practical advice
- Always include appropriate medical disclaimers
- Can discuss other diseases but emphasize malaria expertise

${messages && messages.length > 0 ? `Previous conversation:
${messages.map(msg => `${msg.role === 'user' ? 'Patient' : 'Dr. MESMTF'}: ${msg.content}`).join('\n')}

` : ''}Patient: ${message}

Dr. MESMTF: `

    const result = await model.generateContent(diagnosisPrompt)
    const response = await result.response
    const aiResponse = response.text()

    res.json({
      message: 'AI diagnosis chat response',
      success: true,
      data: {
        response: aiResponse,
        disclaimer: '⚠️ This is AI-generated medical information with focus on MALARIA and tropical diseases. Always consult with qualified healthcare professionals for proper diagnosis and treatment.',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Gemini AI Error:', error)

    // Fallback response
    res.json({
      message: 'AI diagnosis chat response (fallback)',
      success: true,
      data: {
        response: `I'm Dr. MESMTF, your medical AI assistant with expertise in tropical and infectious diseases, especially MALARIA. I'm currently experiencing some technical difficulties, but I'm here to help!

Could you tell me more about your symptoms? I can help analyze:

� **MALARIA symptoms** (PRIORITY): Fever, chills, sweats, headache, muscle aches, fatigue - especially if you've traveled to malaria-endemic areas
�🦠 **Typhoid Fever symptoms**: High stepwise fever, headache, abdominal pain, rose spots
🦋 **Thyroid Disease symptoms**: Weight changes, temperature sensitivity, heart rate changes, fatigue
🌡️ **Other tropical diseases**: Dengue, chikungunya, yellow fever

**IMPORTANT**: If you have fever and have traveled to malaria-endemic areas (Africa, Asia, South America), seek immediate medical attention for malaria testing!

Please describe your symptoms, travel history, and I'll provide helpful medical guidance.

⚠️ Remember: This is for informational purposes only. Please consult with a healthcare professional for proper medical care.`,
        disclaimer: '⚠️ This is AI-generated medical information. Always consult healthcare professionals.',
        timestamp: new Date().toISOString()
      }
    })
  }
})

// AI Education Chat
app.post('/api/v1/ai/education', authenticateToken, async (req, res) => {
  const { message, userRole, messages } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" })

    // Create conversational education prompt
    const educationPrompt = `You are Professor MESMTF, a highly knowledgeable and friendly medical education AI assistant with comprehensive expertise in tropical and infectious diseases. You chat naturally like ChatGPT and provide educational content on various medical conditions, with special focus on MALARIA education.

📚 YOUR ROLE: Medical Education Specialist in Tropical Medicine
🎯 PRIMARY FOCUS: Malaria Education & Tropical Disease Learning
👤 USER ROLE: ${userRole || 'Student'}

📖 COMPREHENSIVE EDUCATIONAL EXPERTISE:

🦟 **MALARIA EDUCATION (PRIMARY FOCUS)**:
🔹 **BASICS**: Parasitic disease caused by Plasmodium species, transmitted by Anopheles mosquitoes
🔹 **PARASITES**: P. falciparum (most deadly), P. vivax (most common), P. ovale, P. malariae, P. knowlesi
🔹 **LIFE CYCLE**: Complex cycle between mosquito vector and human host, liver and blood stages
🔹 **SYMPTOMS**: Fever, chills, sweats (cyclical pattern), headache, muscle aches, fatigue, nausea
🔹 **SEVERE MALARIA**: Cerebral malaria, severe anemia, respiratory distress, multi-organ failure
🔹 **DIAGNOSIS**: Microscopy (gold standard), rapid diagnostic tests (RDT), PCR for species identification
🔹 **TREATMENT**: Artemisinin-based combination therapy (ACT), severe cases need IV artesunate
🔹 **PREVENTION**: Vector control (bed nets, spraying), chemoprophylaxis, early diagnosis and treatment
🔹 **EPIDEMIOLOGY**: Endemic in tropical regions, seasonal patterns, drug resistance issues
🔹 **PUBLIC HEALTH**: Global burden, elimination strategies, community health approaches

✅ **TYPHOID FEVER EDUCATION**:
🔹 **BASICS**: Bacterial infection caused by Salmonella Typhi, fecal-oral transmission
🔹 **SYMPTOMS**: High stepwise fever, headache, abdominal pain, rose spots, constipation/diarrhea
🔹 **DIAGNOSIS**: Blood culture, stool culture, rapid tests, travel history important
🔹 **TREATMENT**: Antibiotics (fluoroquinolones, cephalosporins, macrolides)
🔹 **PREVENTION**: Vaccination, safe food/water, good sanitation

✅ **THYROID DISEASE EDUCATION**:
🔹 **ANATOMY**: Butterfly-shaped endocrine gland, produces T3/T4 hormones
🔹 **HYPOTHYROIDISM**: Underactive thyroid - fatigue, weight gain, cold sensitivity
🔹 **HYPERTHYROIDISM**: Overactive thyroid - weight loss, heat sensitivity, rapid heartbeat
🔹 **DIAGNOSIS**: TSH screening, T3/T4 levels, thyroid antibodies
🔹 **TREATMENT**: Hormone replacement (hypo), antithyroid drugs (hyper)

🌍 **OTHER TROPICAL DISEASES**:
🔹 **DENGUE**: Aedes mosquito-borne, fever, headache, muscle pain, hemorrhagic complications
🔹 **CHIKUNGUNYA**: Joint pain, fever, rash, chronic arthritis
🔹 **YELLOW FEVER**: Vaccine-preventable, hemorrhagic fever, liver involvement

🎓 **EDUCATIONAL APPROACH**:
- **Prioritize malaria education** - most important tropical disease globally
- Adapt explanations to user's background and learning level
- Use case studies and real-world examples
- Explain disease mechanisms, epidemiology, and public health impact
- Provide evidence-based, up-to-date information
- Encourage critical thinking and clinical reasoning
- Connect basic science to clinical practice

💬 **CONVERSATION STYLE**:
- Chat naturally and educationally like ChatGPT
- Use analogies and visual descriptions for complex concepts
- Encourage questions and deeper exploration
- Provide practical, actionable educational content
- Always emphasize this is for educational purposes only
- Can discuss various diseases but emphasize malaria expertise

${messages && messages.length > 0 ? `Previous conversation:
${messages.map(msg => `${msg.role === 'user' ? 'Student' : 'Professor MESMTF'}: ${msg.content}`).join('\n')}

` : ''}Student: ${message}

Professor MESMTF: `

    const result = await model.generateContent(educationPrompt)
    const response = await result.response
    const aiResponse = response.text()

    res.json({
      message: 'AI education chat response',
      success: true,
      data: {
        response: aiResponse,
        userRole: userRole || 'Student',
        disclaimer: '📖 This content is for EDUCATIONAL PURPOSES ONLY. Always consult with qualified healthcare professionals for medical advice, diagnosis, or treatment.',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Gemini AI Education Error:', error)

    // Fallback educational response
    const fallbackContent = `Hello! I'm Professor MESMTF, your medical education AI assistant with comprehensive expertise in tropical and infectious diseases, especially MALARIA education. I'm currently experiencing some technical difficulties, but I'm here to help you learn!

I can teach you about:

🦟 **MALARIA** (PRIMARY FOCUS):
- Parasitic disease caused by Plasmodium species (P. falciparum, P. vivax, etc.)
- Transmitted by Anopheles mosquitoes in tropical regions
- Symptoms: Fever, chills, sweats, headache, muscle aches, fatigue
- Diagnosis: Microscopy, rapid diagnostic tests (RDT), PCR
- Treatment: Artemisinin-based combination therapy (ACT)
- Prevention: Bed nets, antimalarial drugs, vector control
- Global impact: Major cause of morbidity and mortality in tropical regions

🦠 **Typhoid Fever**:
- Bacterial infection caused by Salmonella Typhi
- Symptoms: High stepwise fever, headache, abdominal pain, rose spots
- Prevention: Vaccination, good hygiene, safe food/water
- Treatment: Antibiotics like Ciprofloxacin, Ceftriaxone

🦋 **Thyroid Disease**:
- Hypothyroidism: Underactive thyroid (fatigue, weight gain, cold sensitivity)
- Hyperthyroidism: Overactive thyroid (weight loss, rapid heartbeat, heat sensitivity)
- Diagnosis: TSH, T3, T4 blood tests
- Treatment: Hormone replacement or antithyroid medications

🌡️ **Other Tropical Diseases**:
- Dengue: Aedes mosquito-borne, fever, headache, muscle pain
- Chikungunya: Joint pain, fever, rash
- Yellow fever: Vaccine-preventable hemorrhagic fever

What would you like to learn about? Feel free to ask specific questions!

📖 Remember: This is for educational purposes only. Always consult healthcare professionals for medical advice.`

    res.json({
      message: 'AI education chat response (fallback)',
      success: true,
      data: {
        response: fallbackContent,
        userRole: userRole || 'Student',
        disclaimer: '📖 This is educational content only. Always consult healthcare professionals.',
        timestamp: new Date().toISOString()
      }
    })
  }
})

// AI Status
app.get('/api/v1/ai/status', authenticateToken, (req, res) => {
  res.json({
    message: 'AI service status',
    success: true,
    data: {
      status: 'operational',
      services: {
        diagnosis: 'available',
        education: 'available',
        recommendations: 'available'
      },
      lastUpdated: new Date().toISOString()
    }
  })
})

// ============================================================================
// ACTIVITY LOGS ENDPOINTS
// ============================================================================

// Get activity logs
app.get('/api/v1/activity-logs', authenticateToken, (req, res) => {
  const { userId, entityType, limit = 50 } = req.query

  let query = `SELECT al.*, u.firstName, u.lastName, u.role
               FROM activity_logs al
               LEFT JOIN users u ON al.userId = u.id
               WHERE 1=1`

  const params = []

  if (userId) {
    query += ` AND al.userId = ?`
    params.push(userId)
  }

  if (entityType) {
    query += ` AND al.entityType = ?`
    params.push(entityType)
  }

  query += ` ORDER BY al.timestamp DESC LIMIT ?`
  params.push(parseInt(limit))

  db.all(query, params, (err, logs) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        message: 'Failed to fetch activity logs',
        success: false,
        error: err.message
      })
    }

    res.json({
      message: 'Activity logs retrieved successfully',
      success: true,
      data: logs || []
    })
  })
})

// Get recent activities for dashboard
app.get('/api/v1/dashboard/recent-activities', authenticateToken, (req, res) => {
  const query = `SELECT al.*, u.firstName, u.lastName, u.role
                 FROM activity_logs al
                 LEFT JOIN users u ON al.userId = u.id
                 ORDER BY al.timestamp DESC
                 LIMIT 10`

  db.all(query, [], (err, activities) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({
        message: 'Failed to fetch recent activities',
        success: false,
        error: err.message
      })
    }

    res.json({
      message: 'Recent activities retrieved successfully',
      success: true,
      data: activities || []
    })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MESMTF Healthcare Backend Server running on port ${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/health`)
  console.log(`� Database: SQLite (${dbPath})`)
  console.log(``)
  console.log(`🔐 Authentication Endpoints:`)
  console.log(`   POST /api/v1/auth/login - User login`)
  console.log(`   POST /api/v1/auth/register - User registration`)
  console.log(`   GET  /api/v1/auth/me - Get current user`)
  console.log(`   POST /api/v1/auth/logout - User logout`)
  console.log(``)
  console.log(`� User Management:`)
  console.log(`   GET  /api/v1/users - Get all users (Admin only)`)
  console.log(``)
  console.log(`🤒 Patient Management:`)
  console.log(`   GET  /api/v1/patients - Get all patients`)
  console.log(`   GET  /api/v1/patients/:id - Get single patient`)
  console.log(`   PUT  /api/v1/patients/:id - Update patient`)
  console.log(``)
  console.log(`📅 Appointments:`)
  console.log(`   GET  /api/v1/appointments - Get appointments`)
  console.log(`   POST /api/v1/appointments - Create appointment`)
  console.log(`   PUT  /api/v1/appointments/:id - Update appointment`)
  console.log(`   POST /api/v1/appointments/:id/cancel - Cancel appointment`)
  console.log(``)
  console.log(`📋 Medical Records:`)
  console.log(`   GET  /api/v1/patients/:id/medical-records - Get patient records`)
  console.log(`   POST /api/v1/patients/:id/medical-records - Add medical record`)
  console.log(`   GET  /api/v1/medical-records - Get all records`)
  console.log(``)
  console.log(`🏥 Treatment Episodes:`)
  console.log(`   GET  /api/v1/episodes - Get episodes`)
  console.log(`   POST /api/v1/episodes - Create episode`)
  console.log(`   PUT  /api/v1/episodes/:id - Update episode`)
  console.log(``)
  console.log(`💊 Prescriptions & Medications:`)
  console.log(`   GET  /api/v1/prescriptions - Get prescriptions`)
  console.log(`   POST /api/v1/prescriptions - Create prescription`)
  console.log(`   POST /api/v1/prescriptions/:id/dispense - Dispense prescription`)
  console.log(`   GET  /api/v1/medications - Get medications`)
  console.log(`   GET  /api/v1/medications/search/:query - Search medications`)
  console.log(``)
  console.log(`📊 Vital Signs:`)
  console.log(`   GET  /api/v1/patients/:id/vital-signs - Get vital signs`)
  console.log(`   POST /api/v1/patients/:id/vital-signs - Record vital signs`)
  console.log(``)
  console.log(`🔔 Notifications:`)
  console.log(`   GET  /api/v1/notifications - Get notifications`)
  console.log(`   GET  /api/v1/notifications/unread-count - Get unread count`)
  console.log(`   PUT  /api/v1/notifications/:id/mark-read - Mark as read`)
  console.log(``)
  console.log(`🤖 AI Services:`)
  console.log(`   POST /api/v1/ai/diagnosis - AI diagnosis`)
  console.log(`   POST /api/v1/ai/education - AI education`)
  console.log(`   GET  /api/v1/ai/status - AI service status`)
  console.log(``)
  console.log(`👥 Test Users (password: healthcare123):`)
  console.log(`   🩺 dr.michael.brown@hospital.com (Doctor)`)
  console.log(`   👩‍⚕️ lisa.wilson@hospital.com (Nurse)`)
  console.log(`   🏥 maria.garcia@hospital.com (Receptionist)`)
  console.log(`   💊 robert.anderson@pharmacy.com (Pharmacist)`)
  console.log(`   🤒 john.smith@email.com (Patient)`)
  console.log(`   👨‍💼 admin.manager@hospital.com (Admin)`)
  console.log(``)
  console.log(`🎯 Ready for frontend integration!`)
})
