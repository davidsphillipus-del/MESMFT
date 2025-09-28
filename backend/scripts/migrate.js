#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const DB_PATH = process.env.DATABASE_PATH || './healthcare.db'

// Migration scripts
const migrations = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'ADMIN')),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Patients table
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date_of_birth DATE,
        gender TEXT CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
        address TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        medical_history TEXT,
        allergies TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      -- Doctors table
      CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        license_number TEXT UNIQUE,
        specialization TEXT,
        years_of_experience INTEGER,
        consultation_fee DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
      CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
    `,
    down: `
      DROP INDEX IF EXISTS idx_doctors_user_id;
      DROP INDEX IF EXISTS idx_patients_user_id;
      DROP INDEX IF EXISTS idx_users_role;
      DROP INDEX IF EXISTS idx_users_email;
      DROP TABLE IF EXISTS doctors;
      DROP TABLE IF EXISTS patients;
      DROP TABLE IF EXISTS users;
    `
  },
  {
    version: 2,
    name: 'appointments_and_episodes',
    up: `
      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        appointment_date DATETIME NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
        reason TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
      );

      -- Medical episodes table
      CREATE TABLE IF NOT EXISTS medical_episodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        appointment_id INTEGER,
        episode_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        chief_complaint TEXT,
        diagnosis TEXT,
        treatment_plan TEXT,
        status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'CHRONIC', 'REFERRED')),
        follow_up_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id),
        FOREIGN KEY (appointment_id) REFERENCES appointments (id)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_episodes_patient_id ON medical_episodes(patient_id);
      CREATE INDEX IF NOT EXISTS idx_episodes_doctor_id ON medical_episodes(doctor_id);
    `,
    down: `
      DROP INDEX IF EXISTS idx_episodes_doctor_id;
      DROP INDEX IF EXISTS idx_episodes_patient_id;
      DROP INDEX IF EXISTS idx_appointments_date;
      DROP INDEX IF EXISTS idx_appointments_doctor_id;
      DROP INDEX IF EXISTS idx_appointments_patient_id;
      DROP TABLE IF EXISTS medical_episodes;
      DROP TABLE IF EXISTS appointments;
    `
  },
  {
    version: 3,
    name: 'prescriptions_and_medications',
    up: `
      -- Medications table
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        generic_name TEXT,
        dosage_form TEXT,
        strength TEXT,
        manufacturer TEXT,
        price DECIMAL(10,2),
        stock_quantity INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Prescriptions table
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        episode_id INTEGER NOT NULL,
        medication_id INTEGER NOT NULL,
        dosage TEXT NOT NULL,
        frequency TEXT NOT NULL,
        duration_days INTEGER,
        quantity INTEGER NOT NULL,
        instructions TEXT,
        status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED')),
        prescribed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        dispensed_date DATETIME,
        dispensed_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (episode_id) REFERENCES medical_episodes (id),
        FOREIGN KEY (medication_id) REFERENCES medications (id),
        FOREIGN KEY (dispensed_by) REFERENCES users (id)
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_episode_id ON prescriptions(episode_id);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_medication_id ON prescriptions(medication_id);
      CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
    `,
    down: `
      DROP INDEX IF EXISTS idx_prescriptions_status;
      DROP INDEX IF EXISTS idx_prescriptions_medication_id;
      DROP INDEX IF EXISTS idx_prescriptions_episode_id;
      DROP INDEX IF EXISTS idx_medications_name;
      DROP TABLE IF EXISTS prescriptions;
      DROP TABLE IF EXISTS medications;
    `
  }
]

// Migration tracking table
const createMigrationTable = `
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`

async function runMigrations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err)
        return
      }
      
      console.log('🔗 Connected to SQLite database')
      
      // Create migration tracking table
      db.run(createMigrationTable, (err) => {
        if (err) {
          reject(err)
          return
        }
        
        // Get current migration version
        db.get('SELECT MAX(version) as current_version FROM migrations', (err, row) => {
          if (err) {
            reject(err)
            return
          }
          
          const currentVersion = row?.current_version || 0
          console.log(`📊 Current migration version: ${currentVersion}`)
          
          // Run pending migrations
          const pendingMigrations = migrations.filter(m => m.version > currentVersion)
          
          if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations')
            db.close()
            resolve()
            return
          }
          
          console.log(`🔄 Running ${pendingMigrations.length} pending migration(s)...`)
          
          let completed = 0
          
          pendingMigrations.forEach(migration => {
            db.exec(migration.up, (err) => {
              if (err) {
                console.error(`❌ Migration ${migration.version} failed:`, err.message)
                reject(err)
                return
              }
              
              // Record migration
              db.run(
                'INSERT INTO migrations (version, name) VALUES (?, ?)',
                [migration.version, migration.name],
                (err) => {
                  if (err) {
                    reject(err)
                    return
                  }
                  
                  console.log(`✅ Migration ${migration.version} (${migration.name}) completed`)
                  completed++
                  
                  if (completed === pendingMigrations.length) {
                    console.log('🎉 All migrations completed successfully!')
                    db.close()
                    resolve()
                  }
                }
              )
            })
          })
        })
      })
    })
  })
}

// If run directly
if (require.main === module) {
  console.log('🏥 MESMTF Database Migration Tool')
  console.log('=================================')
  
  runMigrations()
    .then(() => {
      console.log('✅ Migration process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error.message)
      process.exit(1)
    })
}

module.exports = { runMigrations }
