// src/server.js

import 'dotenv/config'
import http from 'http'
import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'

import './config/redis.js' 
// ✅ ADDED: just import file → triggers auto Redis connection

import { createApp } from './app.js'
import { initSocket } from './socket/socket.manager.js'
import { setSocketIO } from './queue/forge.worker.js'

async function bootstrap() {
  // Connect to database
  await connectDatabase()

  // Create Express app
  const app = createApp()

  // Create HTTP server (required for Socket.io)
  const httpServer = http.createServer(app)

  // Initialize Socket.io
  const io = initSocket(httpServer)

  // Give worker access to Socket.io
  setSocketIO(io)

  // Start server
  httpServer.listen(config.PORT, () => {
    console.log(`\n🔥 Forge backend running`)
    console.log(`   Port       : ${config.PORT}`)
    console.log(`   Environment: ${config.NODE_ENV}`)
    console.log(`   API base   : http://localhost:${config.PORT}/api/v1`)
    console.log(`   Health     : http://localhost:${config.PORT}/health\n`)
  })

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`)
    httpServer.close(async () => {
      const { disconnectDatabase } = await import('./config/database.js')
      await disconnectDatabase()
      console.log('Server closed.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})