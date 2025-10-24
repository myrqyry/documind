# Create Express server setup
server_code = '''import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { DocuMind } from './core/DocuMind.js';
import { setupRoutes } from './api/routes.js';
import { setupWebSocket } from './api/websocket.js';
import type { APIResponse } from './types/index.js';

// Environment configuration
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is required');
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
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX || '100'), // requests
  duration: 60, // per 60 seconds
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.'
      }
    };
    res.status(429).json(response);
  }
});

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '50') * 1024 * 1024 // MB to bytes
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

// Health check endpoint
app.get('/health', (req, res) => {
  const response: APIResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
      uptime: process.uptime()
    }
  };
  res.json(response);
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
  console.log(`🔑 Gemini API: ${GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
  console.log(`🛡️  CORS origins: ${CORS_ORIGINS.join(', ')}`);
  
  if (process.env.ENABLE_MCP === 'true') {
    console.log(`🤖 MCP Server: Enabled on port ${process.env.MCP_SERVER_PORT || 3001}`);
  }
});

export { app, server, io, documind };'''

# Save to file
with open('server.ts', 'w') as f:
    f.write(server_code)

print("✅ Created server.ts - Express server setup")
print("File size:", len(server_code), "characters")