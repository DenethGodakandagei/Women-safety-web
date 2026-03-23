require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const sosRoutes = require('./routes/sosRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const riskRoutes = require('./routes/riskRoutes');


const app = express();

// Log incoming to verify traffic
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.8.148:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// Debug Log for all requests
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// ROUTES
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/risk', riskRoutes);


// Root Hello
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'SheShield API V1' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('--- GLOBAL ERROR ---', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = 5000;
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('--- MongoDB Connected ---');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- Server Running on 0.0.0.0:${PORT} ---`);
    console.log(`--- Accessible via http://192.168.8.148:${PORT} ---`);
  });
}).catch(err => {
  console.error('--- MongoDB Connection Error ---', err);
});
