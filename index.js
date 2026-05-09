import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
//import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { initSocket } from './socket/socketHandler.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import serviceRoutes from './routes/service.routes.js';
import ticketRoutes from "./routes/ticket.routes.js";
import userRouters from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js"

// ========================== App Initialization ==========================

dotenv.config();


// Connect to MongoDB
connectDB();


const app = express();
const server = http.createServer(app);



// Initialize Socket.IO
initSocket(server);

// Global Middleware
app.use(helmet());
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
//app.use(morgan('combined'));
// API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reports', reportRoutes);

// ── Health Check ───────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Pelayanan Kampus API berjalan',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});


const port = 3000;

// app.use(bodyParser.json({
//   limit: '10mb'
// }));
// app.use(bodyParser.urlencoded({
//   limit: '10mb',
//   extended: true
// }));




if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// ── 404 Handler ────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
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