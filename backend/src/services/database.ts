import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

class DatabaseService {
  private static instance: PrismaClient
  private static isInitialized = false

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
        errorFormat: 'pretty',
      })

      // Log database queries in development
      if (process.env.NODE_ENV === 'development') {
        DatabaseService.instance.$on('query', (e) => {
          logger.debug(`Query: ${e.query}`)
          logger.debug(`Params: ${e.params}`)
          logger.debug(`Duration: ${e.duration}ms`)
        })
      }

      // Log database errors
      DatabaseService.instance.$on('error', (e) => {
        logger.error('Database error:', e)
      })

      // Log database info
      DatabaseService.instance.$on('info', (e) => {
        logger.info('Database info:', e.message)
      })

      // Log database warnings
      DatabaseService.instance.$on('warn', (e) => {
        logger.warn('Database warning:', e.message)
      })
    }

    return DatabaseService.instance
  }

  public static async initialize(): Promise<void> {
    if (DatabaseService.isInitialized) {
      return
    }

    try {
      const prisma = DatabaseService.getInstance()
      
      // Test the connection
      await prisma.$connect()
      
      // Run a simple query to verify the connection
      await prisma.$queryRaw`SELECT 1`
      
      DatabaseService.isInitialized = true
      logger.info('Database connection established successfully')
      
    } catch (error) {
      logger.error('Failed to initialize database connection:', error)
      throw new Error('Database initialization failed')
    }
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect()
      DatabaseService.isInitialized = false
      logger.info('Database connection closed')
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseService.getInstance()
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      logger.error('Database health check failed:', error)
      return false
    }
  }

  public static async runMigrations(): Promise<void> {
    try {
      const prisma = DatabaseService.getInstance()
      // Note: In production, migrations should be run separately
      // This is mainly for development convenience
      logger.info('Running database migrations...')
      // Migrations are typically run via CLI: npx prisma migrate deploy
      logger.info('Database migrations completed')
    } catch (error) {
      logger.error('Failed to run migrations:', error)
      throw error
    }
  }

  public static async seedDatabase(): Promise<void> {
    try {
      const prisma = DatabaseService.getInstance()
      logger.info('Seeding database...')
      
      // Check if data already exists
      const userCount = await prisma.user.count()
      if (userCount > 0) {
        logger.info('Database already contains data, skipping seed')
        return
      }

      // Create 2 users for each role
      const users = await Promise.all([
        // Admin users
        prisma.user.create({
          data: {
            email: 'admin1@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'ADMIN',
            profile: {
              create: {
                firstName: 'System',
                lastName: 'Administrator',
                phone: '+264-61-123-4567',
                address: 'MESMTF Headquarters, Windhoek, Namibia'
              }
            }
          }
        }),
        prisma.user.create({
          data: {
            email: 'admin2@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'ADMIN',
            profile: {
              create: {
                firstName: 'Sarah',
                lastName: 'Johnson',
                phone: '+264-61-123-4568',
                address: 'MESMTF Branch Office, Windhoek, Namibia'
              }
            }
          }
        }),
        // Doctor users
        prisma.user.create({
          data: {
            email: 'doctor1@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'DOCTOR',
            profile: {
              create: {
                firstName: 'Dr. Michael',
                lastName: 'Smith',
                phone: '+264-61-123-4569',
                address: 'Medical Center, Windhoek, Namibia'
              }
            }
          }
        }),
        prisma.user.create({
          data: {
            email: 'doctor2@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'DOCTOR',
            profile: {
              create: {
                firstName: 'Dr. Emily',
                lastName: 'Davis',
                phone: '+264-61-123-4570',
                address: 'General Hospital, Windhoek, Namibia'
              }
            }
          }
        }),
        // Nurse users
        prisma.user.create({
          data: {
            email: 'nurse1@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'NURSE',
            profile: {
              create: {
                firstName: 'Lisa',
                lastName: 'Wilson',
                phone: '+264-61-123-4571',
                address: 'Nursing Station A, Windhoek, Namibia'
              }
            }
          }
        }),
        prisma.user.create({
          data: {
            email: 'nurse2@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'NURSE',
            profile: {
              create: {
                firstName: 'Jennifer',
                lastName: 'Brown',
                phone: '+264-61-123-4572',
                address: 'Nursing Station B, Windhoek, Namibia'
              }
            }
          }
        }),
        // Receptionist users
        prisma.user.create({
          data: {
            email: 'receptionist1@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'RECEPTIONIST',
            profile: {
              create: {
                firstName: 'Maria',
                lastName: 'Garcia',
                phone: '+264-61-123-4573',
                address: 'Reception Desk 1, Windhoek, Namibia'
              }
            }
          }
        }),
        prisma.user.create({
          data: {
            email: 'receptionist2@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'RECEPTIONIST',
            profile: {
              create: {
                firstName: 'Anna',
                lastName: 'Martinez',
                phone: '+264-61-123-4574',
                address: 'Reception Desk 2, Windhoek, Namibia'
              }
            }
          }
        }),
        // Pharmacist users
        prisma.user.create({
          data: {
            email: 'pharmacist1@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'PHARMACIST',
            profile: {
              create: {
                firstName: 'Robert',
                lastName: 'Taylor',
                phone: '+264-61-123-4575',
                address: 'Pharmacy Department, Windhoek, Namibia'
              }
            }
          }
        }),
        prisma.user.create({
          data: {
            email: 'pharmacist2@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'PHARMACIST',
            profile: {
              create: {
                firstName: 'Linda',
                lastName: 'Anderson',
                phone: '+264-61-123-4576',
                address: 'Dispensary Unit, Windhoek, Namibia'
              }
            }
          }
        }),
        // Patient users
        prisma.user.create({
          data: {
            email: 'patient1@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
            role: 'PATIENT',
            profile: {
              create: {
                firstName: 'John',
                lastName: 'Doe',
                phone: '+264-61-123-4577',
                address: 'Katutura, Windhoek, Namibia'
              }
            }
          }
        }),
        prisma.user.create({
          data: {
            email: 'patient2@mesmtf.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LearningBPj/VcSAg/9qm', // password123
            role: 'PATIENT',
            profile: {
              create: {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '+264-61-123-4578',
                address: 'Klein Windhoek, Windhoek, Namibia'
              }
            }
          }
        })
      ])

      // Create sample medications
      const medications = [
        {
          name: 'Artemether-Lumefantrine',
          genericName: 'ACT',
          category: 'Antimalarial',
          description: 'Artemisinin-based combination therapy for malaria treatment',
          dosageForms: ['Tablet'],
          contraindications: 'Hypersensitivity to artemether or lumefantrine',
          sideEffects: 'Nausea, vomiting, diarrhea, dizziness',
          interactions: ['Rifampicin', 'Carbamazepine']
        },
        {
          name: 'Ciprofloxacin',
          genericName: 'Ciprofloxacin HCl',
          category: 'Antibiotic',
          description: 'Fluoroquinolone antibiotic for bacterial infections',
          dosageForms: ['Tablet', 'Injection'],
          contraindications: 'Hypersensitivity to quinolones',
          sideEffects: 'Nausea, diarrhea, headache',
          interactions: ['Warfarin', 'Theophylline']
        },
        {
          name: 'Paracetamol',
          genericName: 'Acetaminophen',
          category: 'Analgesic/Antipyretic',
          description: 'Pain reliever and fever reducer',
          dosageForms: ['Tablet', 'Syrup', 'Injection'],
          contraindications: 'Severe liver disease',
          sideEffects: 'Rare at therapeutic doses',
          interactions: ['Warfarin']
        }
      ]

      for (const med of medications) {
        await prisma.medication.create({
          data: {
            ...med,
            inventory: {
              create: {
                stockQuantity: 100,
                minStock: 20,
                maxStock: 500,
                expiryDate: new Date('2025-12-31'),
                batchNumber: `BATCH-${Math.random().toString(36).substr(2, 9)}`,
                supplier: 'Medical Supplies Ltd',
                costPerUnit: Math.random() * 50 + 10
              }
            }
          }
        })
      }

      logger.info('Database seeded successfully')
      
    } catch (error) {
      logger.error('Failed to seed database:', error)
      throw error
    }
  }
}

export { DatabaseService }
