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


app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Start the server
const PORT = process.env.PORT || port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`MongoDB URI: ${process.env.MONGO_URI}`);
});

export default app;