const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');

const app = express();

// CORS Configuration - supports multiple origins
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1 || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/admin', require('./routes/admin'));

// Lightweight health check (no database query)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'NIC Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check with database verification (optional)
app.get('/health/detailed', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'NIC Portal API is running',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'NIC Portal API is running but database is not connected',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 NIC Portal API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health\n`);
});
