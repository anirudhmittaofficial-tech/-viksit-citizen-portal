import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB, { query } from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Global Uncaught Exception Handler
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception! Shutting down server...', err);
  process.exit(1);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Optimization Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(morgan('dev'));

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    const configuredOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : [];
    const allAllowed = [...localOrigins, ...configuredOrigins];

    if (allAllowed.includes(origin) || configuredOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Health Check API Response Handler
const getHealthStatus = async (req, res) => {
  let isDbConnected = false;
  try {
    const dbRes = await query('SELECT NOW()');
    isDbConnected = dbRes && dbRes.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error.message);
  }
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    success: isDbConnected,
    status: isDbConnected ? 'Operational' : 'Database connection unavailable',
    database: isDbConnected ? 'Connected' : 'Disconnected'
  });
};

// Health Check API Endpoints
app.get('/health', getHealthStatus);
app.get('/api/health', getHealthStatus);

// Root Info Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Smart City Civic Resolution Engine API',
    version: '1.0.0',
    status: 'Operational'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB Atlas and then start Express listening
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Smart Civic Platform running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Server Listen Error Handler
    server.on('error', (err) => {
      console.error('❌ Server Listen Error:', err);
    });

    // Global Unhandled Promise Rejection Handler
    process.on('unhandledRejection', (err) => {
      console.error('💥 Unhandled Promise Rejection:', err.message || err);
      if (server) {
        server.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    console.error('💥 Critical Error: Database connection failed. Exiting server boot...', err.message || err);
    process.exit(1);
  });

