import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { DocuMind } from './DocuMind.js';
import { setupRoutes } from './api/routes.js';
import { setupWebSocket } from './api/websocket.js';
import type { APIResponse } from './types.js';
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs';

// Environment configuration
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
  console.error('❌ Invalid or missing GEMINI_API_KEY');
  process.exit(1);
}

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST']
  }
});

// Initialize DocuMind
const documind = new DocuMind({
  geminiApiKey: GEMINI_API_KEY,
  enableMCP: process.env.ENABLE_MCP === 'true',
  mcpPort: parseInt(process.env.MCP_SERVER_PORT || '3001')
});

// Rate limiting
const strictRateLimiter = new RateLimiterMemory({
  keyPrefix: 'strict',
  points: 10, // requests
  duration: 60, // per 60 seconds
});

const generalRateLimiter = new RateLimiterMemory({
  keyPrefix: 'general',
  points: 100,
  duration: 60,
});

function createRateLimitMiddleware(limiter: RateLimiterMemory) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const key = (req.headers['x-forwarded-for'] as string) || req.ip || req.connection.remoteAddress || 'unknown';
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests'
        }
      };
      res.status(429).json(response);
    }
  };
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? true : false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting
app.use(['/process', '/process-url'], createRateLimitMiddleware(strictRateLimiter));
app.use(createRateLimitMiddleware(generalRateLimiter));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(tmpdir(), 'documind-uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024, // MB to bytes
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown',
      'text/html',
      'application/json',
      'application/xml'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// Cleanup middleware
app.use('/process', (req, res, next) => {
  res.on('finish', () => {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to cleanup temp file:', err);
      });
    }
  });
  next();
});

// Health check endpoint
async function checkGeminiConnection(): Promise<string> {
  // Placeholder for Gemini API connection check
  return 'healthy';
}

async function checkDatabaseConnection(): Promise<string> {
  // Placeholder for database connection check
  return 'healthy';
}

async function checkRedisConnection(): Promise<string> {
  // Placeholder for Redis connection check
  return 'healthy';
}

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      gemini: await checkGeminiConnection(),
      database: await checkDatabaseConnection(),
      redis: await checkRedisConnection()
    }
  };

  const hasFailedServices = Object.values(health.services).some(status => status === 'unhealthy');
  res.status(hasFailedServices ? 503 : 200).json(health);
});

// Setup API routes
setupRoutes(app, documind, upload);

// Setup WebSocket handlers
setupWebSocket(io, documind);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);

  const response: APIResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: NODE_ENV === 'development' ? error.message : 'An internal server error occurred'
    }
  };

  res.status(500).json(response);
});

// 404 handler
app.use((req, res) => {
  const response: APIResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  };
  res.status(404).json(response);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 DocuMind Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔑 Gemini API: ${GEMINI_API_KEY ? 'Configured (' + GEMINI_API_KEY.slice(0, 8) + '...)' : 'Missing'}`);
  console.log(`🛡️  CORS origins: ${CORS_ORIGINS.join(', ')}`);

  if (process.env.ENABLE_MCP === 'true') {
    console.log(`🤖 MCP Server: Enabled on port ${process.env.MCP_SERVER_PORT || 3001}`);
  }
});

export { app, server, io, documind };