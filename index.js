import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { initSocket } from './socket/socketHandler.js';

// Import routes
import authRoutes from './routes/auth.routes.js';

// ========================== App Initialization ==========================

dotenv.config();


// Connect to MongoDB
connectDB();


const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(helmet());
app.use(morgan('combined'));

// ── Health Check ───────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Pelayanan Kampus API berjalan',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use(bodyParser.json());
const port = 3000;



app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({
  limit: '10mb'
}));
app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/services', serviceRoutes);
// app.use('/api/tickets', ticketRoutes);
// app.use('/api/reports', reportRoutes);


// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// ── Global Error Handler ───────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});


// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });




// Start the server
const PORT = process.env.PORT || port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
  console.log(`🔗 URL : http://localhost:${PORT}/api/health\n`);
});

export default app;