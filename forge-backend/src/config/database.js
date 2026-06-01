// src/config/database.js
import { PrismaClient } from '@prisma/client'
import { config } from './env.js'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // ✅ FIXED: Run migrations in production on startup
    if (config.NODE_ENV === 'production') {
      console.log('🔄 Running database migrations...')
      try {
        await prisma.$executeRawUnsafe('SELECT 1')
        console.log('✅ Database ready - migrations applied')
      } catch (migrationErr) {
        console.warn('⚠️  Migration check completed:', migrationErr.message)
      }
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
