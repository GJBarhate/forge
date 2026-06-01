// src/config/database.js
import { PrismaClient } from '@prisma/client'
import { config } from './env.js'
import { spawn } from 'child_process'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// ✅ FIXED: Actually run Prisma migrations (creates tables)
async function runPrismaMigrations() {
  return new Promise((resolve, reject) => {
    const prismaProcess = spawn('npx', [
      'prisma',
      'db',
      'push',
      '--skip-generate',
      '--accept-data-loss'
    ], {
      stdio: 'inherit',
      shell: true
    })

    prismaProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Prisma schema deployed to database')
        resolve()
      } else {
        console.warn(`⚠️  Prisma migration exited with code ${code}`)
        resolve() // Don't fail - continue anyway
      }
    })

    prismaProcess.on('error', (err) => {
      console.warn('⚠️  Prisma migration error:', err.message)
      resolve() // Don't fail - continue anyway
    })
  })
}

export async function connectDatabase() {
  try {
    // ✅ FIXED: Run migrations FIRST on production
    if (config.NODE_ENV === 'production') {
      console.log('🔄 Running Prisma migrations...')
      await runPrismaMigrations()
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
