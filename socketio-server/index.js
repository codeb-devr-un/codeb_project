const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');

const PORT = process.env.PORT || 3010;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'socketio', timestamp: new Date().toISOString() }));
    return;
  }

  // Info endpoint
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'WorkB Socket.io Server',
      version: '1.0.0',
      socketPath: '/socket.io',
      status: 'running'
    }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN.split(',').map(s => s.trim()),
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Redis Adapter
async function setupRedis() {
  try {
    const pubClient = new Redis(REDIS_URL);
    const subClient = pubClient.duplicate();

    await Promise.all([
      new Promise((resolve, reject) => {
        pubClient.on('connect', resolve);
        pubClient.on('error', reject);
      }),
      new Promise((resolve, reject) => {
        subClient.on('connect', resolve);
        subClient.on('error', reject);
      })
    ]);

    io.adapter(createAdapter(pubClient, subClient));
    console.log('Redis adapter connected:', REDIS_URL);
  } catch (err) {
    console.error('Redis connection failed:', err.message);
    console.log('Running without Redis adapter (no horizontal scaling)');
  }
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // Project room management
  socket.on('join-project', (projectId) => {
    socket.join('project:' + projectId);
    console.log(socket.id + ' joined project:' + projectId);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave('project:' + projectId);
    console.log(socket.id + ' left project:' + projectId);
  });

  // Task events
  socket.on('task-moved', (data) => {
    socket.to('project:' + data.projectId).emit('task-moved', data);
  });

  socket.on('task-updated', (data) => {
    socket.to('project:' + data.projectId).emit('task-updated', data);
  });

  socket.on('task-created', (data) => {
    socket.to('project:' + data.projectId).emit('task-created', data);
  });

  socket.on('task-deleted', (data) => {
    socket.to('project:' + data.projectId).emit('task-deleted', data);
  });

  // Chat events
  socket.on('join-chat', (chatId) => {
    socket.join('chat:' + chatId);
  });

  socket.on('chat-message', (data) => {
    socket.to('chat:' + data.chatId).emit('chat-message', data);
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', socket.id, reason);
  });
});

// Start server
setupRedis().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('========================================');
    console.log('  WorkB Socket.io Server');
    console.log('  Listening on port ' + PORT);
    console.log('  Redis: ' + REDIS_URL);
    console.log('========================================');
    console.log('');
  });
});
