#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Load environment variables
require('dotenv').config()

const DB_PATH = process.env.DATABASE_PATH || './healthcare.db'
const BACKUP_DIR = process.env.BACKUP_LOCATION || './backups'
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Create backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupFilename = `healthcare-backup-${timestamp}.db`
const backupPath = path.join(BACKUP_DIR, backupFilename)

console.log('🔄 Starting database backup...')
console.log(`📁 Source: ${DB_PATH}`)
console.log(`💾 Backup: ${backupPath}`)

try {
  // Copy database file
  fs.copyFileSync(DB_PATH, backupPath)
  
  // Verify backup
  if (fs.existsSync(backupPath)) {
    const originalSize = fs.statSync(DB_PATH).size
    const backupSize = fs.statSync(backupPath).size
    
    if (originalSize === backupSize) {
      console.log('✅ Backup created successfully!')
      console.log(`📊 Size: ${(backupSize / 1024 / 1024).toFixed(2)} MB`)
      
      // Create backup info file
      const backupInfo = {
        timestamp: new Date().toISOString(),
        originalPath: DB_PATH,
        backupPath: backupPath,
        size: backupSize,
        checksum: generateChecksum(backupPath)
      }
      
      fs.writeFileSync(
        backupPath + '.info',
        JSON.stringify(backupInfo, null, 2)
      )
      
      // Clean up old backups
      cleanupOldBackups()
      
    } else {
      throw new Error('Backup verification failed: size mismatch')
    }
  } else {
    throw new Error('Backup file was not created')
  }
  
} catch (error) {
  console.error('❌ Backup failed:', error.message)
  process.exit(1)
}

function generateChecksum(filePath) {
  try {
    const crypto = require('crypto')
    const fileBuffer = fs.readFileSync(filePath)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(fileBuffer)
    return hashSum.digest('hex')
  } catch (error) {
    console.warn('⚠️  Could not generate checksum:', error.message)
    return null
  }
}

function cleanupOldBackups() {
  try {
    console.log('🧹 Cleaning up old backups...')
    
    const files = fs.readdirSync(BACKUP_DIR)
    const backupFiles = files.filter(file => 
      file.startsWith('healthcare-backup-') && file.endsWith('.db')
    )
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)
    
    let deletedCount = 0
    
    backupFiles.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = fs.statSync(filePath)
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath)
        
        // Also delete info file if it exists
        const infoFile = filePath + '.info'
        if (fs.existsSync(infoFile)) {
          fs.unlinkSync(infoFile)
        }
        
        deletedCount++
        console.log(`🗑️  Deleted old backup: ${file}`)
      }
    })
    
    if (deletedCount === 0) {
      console.log('✨ No old backups to clean up')
    } else {
      console.log(`🧹 Cleaned up ${deletedCount} old backup(s)`)
    }
    
  } catch (error) {
    console.warn('⚠️  Cleanup warning:', error.message)
  }
}

// If run directly
if (require.main === module) {
  console.log('🏥 MESMTF Database Backup Tool')
  console.log('================================')
}
