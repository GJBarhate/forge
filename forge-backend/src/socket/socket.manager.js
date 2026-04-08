// src/socket/socket.manager.js
import { Server } from 'socket.io'
import { config } from '../config/env.js'
import { verifyAccessToken } from '../utils/jwtUtils.js'

let _io = null

export function initSocket(httpServer) {
  _io = new Server(httpServer, {
    cors: {
      origin: config.CLIENT_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // ── Auth middleware on every connection ─────────────────────
  _io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Authentication failed — no token provided'))
    }
    try {
      const user = verifyAccessToken(token)
      socket.userId = user.id
      next()
    } catch {
      next(new Error('Authentication failed — invalid token'))
    }
  })

  // ── Connection handler ──────────────────────────────────────
  _io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected (${socket.id})`);

    // Client joins a job room to receive progress events
    socket.on('join:job', (jobId) => {
      if (typeof jobId !== 'string' || !jobId.trim()) {
        console.warn(`[Socket] ❌ Invalid jobId received: ${jobId}`);
        return;
      }
      const roomName = `forge-job:${jobId}`;
      socket.join(roomName);
      const roomSize = _io.sockets.adapter.rooms.get(roomName)?.size || 0;
      console.log(`\n🔗 [Socket] JOIN JOB`);
      console.log(`  User ID    : ${socket.userId}`);
      console.log(`  Job ID     : ${jobId}`);
      console.log(`  Room       : ${roomName}`);
      console.log(`  Room size  : ${roomSize}\n`);
    });

    // Client leaves job room when done
    socket.on('leave:job', (jobId) => {
      const roomName = `forge-job:${jobId}`;
      socket.leave(roomName);
      const roomSize = _io.sockets.adapter.rooms.get(roomName)?.size || 0;
      console.log(`[Socket] User ${socket.userId} left job room: ${roomName} (room size: ${roomSize})`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User ${socket.userId} disconnected: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error for user ${socket.userId}:`, err.message);
    });
  });

  console.log('✅ Socket.io initialized')
  return _io
}

export function getIO() {
  if (!_io) throw new Error('Socket.io not initialized — call initSocket first')
  return _io
}
