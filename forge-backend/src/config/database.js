// src/config/database.js
import { PrismaClient } from '@prisma/client'
import { config } from './env.js'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function runMigrations() {
  try {
    console.log('🔄 Running Prisma migrations...')
    execSync('npx prisma migrate deploy', {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
    })
    console.log('✅ Migrations completed successfully')
  } catch (err) {
    console.warn('⚠️ Migration warning:', err.message)
    // Don't fail on migration errors, just warn
  }
}

export async function connectDatabase() {
  try {
    // Run migrations first
    if (config.NODE_ENV === 'production') {
      await runMigrations()
    }
    
    await prisma.$connect()
    console.log('✅ Database connected')
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}
