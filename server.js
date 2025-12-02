/**
 * Custom Server for Next.js Standalone with Socket.io
 * 
 * This server wraps the Next.js standalone output and adds Socket.io support.
 * Run with: node server.js
 */

const path = require('path')
const { createServer } = require('http')

// Load environment variables
require('dotenv').config()

const hostname = process.env.HOSTNAME || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

// For standalone mode, we need to set up the environment
process.env.NODE_ENV = 'production'

async function startServer() {
  const { Server: SocketIOServer } = require('socket.io')
  const { createAdapter } = require('@socket.io/redis-adapter')
  const Redis = require('ioredis')

  // Import Next.js from standalone
  const NextServer = require('next/dist/server/next-server').default
  
  const nextConfig = require('./.next/standalone/server.js').__NEXT_PRIVATE_STANDALONE_CONFIG 
    ? JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG || '{}')
    : require('./.next/required-server-files.json').config

  const app = new NextServer({
    hostname,
    port,
    dir: path.join(__dirname, '.next/standalone'),
    dev: false,
    conf: nextConfig,
  })

  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer(async (req, res) => {
    try {
      await handle(req, res)
    } catch (err) {
      console.error('Error handling request:', err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Redis Adapter for scaling
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    const pubClient = new Redis(redisUrl)
    const subClient = pubClient.duplicate()
    
    pubClient.on('error', (err) => console.error('Redis Pub Error:', err))
    subClient.on('error', (err) => console.error('Redis Sub Error:', err))
    
    io.adapter(createAdapter(pubClient, subClient))
    console.log('✓ Socket.io Redis adapter connected')
  } catch (err) {
    console.warn('Redis adapter failed:', err.message)
  }

  // Socket.io handlers
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`)
      console.log(`Socket ${socket.id} joined project:${projectId}`)
    })

    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`)
    })

    socket.on('task-moved', (data) => {
      socket.to(`project:${data.projectId}`).emit('task-moved', data)
    })

    socket.on('task-updated', (data) => {
      socket.to(`project:${data.projectId}`).emit('task-updated', data)
    })

    socket.on('task-created', (data) => {
      socket.to(`project:${data.projectId}`).emit('task-created', data)
    })

    socket.on('task-deleted', (data) => {
      socket.to(`project:${data.projectId}`).emit('task-deleted', data)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })

  server.listen(port, hostname, () => {
    console.log(`
  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │   🚀 Server ready on http://${hostname}:${port}        │
  │   📡 Socket.io ready on /socket.io              │
  │                                                 │
  └─────────────────────────────────────────────────┘
    `)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
