import express from 'express';
import http from 'http';
import cors from 'cors';
import { ENV } from './config/env';
import { db } from './config/database';
import { SocketService } from './services/socketService';
import apiRoutes from './routes';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO
SocketService.initialize(server);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'workforce-intelligence-backend',
    version: '1.0.0',
    mongoConnected: db.isConnectedToMongo(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function start() {
  await db.connectMongo();

  server.listen(ENV.PORT, () => {
    console.log(`🚀 Workforce Intelligence AI API running on http://127.0.0.1:${ENV.PORT}`);
    console.log(`📡 Socket.IO real-time notification engine online`);
  });
}

start();
