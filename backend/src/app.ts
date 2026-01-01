import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import connectDB from './config/database';
import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import categoryRoutes from './routes/categories';
import marqueeRoutes from './routes/marquee';

const app = express();

// Trust proxy for rate limiting behind Nginx
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting configurations - applied per route, not globally
const rateLimitMessage = {
  success: false,
  message: 'बहुत सारे अनुरोध, कृपया बाद में प्रयास करें'
};

// Public read APIs - very high limit (practically unlimited for news reading)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit for public news reading
  message: rateLimitMessage
});

// Admin APIs - moderate limit for dashboard operations
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes for admin operations
  message: rateLimitMessage
});

// Auth APIs - strict limit for security
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes for auth operations
  message: rateLimitMessage
});

// Heavy/costly APIs - very strict limit for uploads and expensive operations
const heavyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour for heavy operations
  message: rateLimitMessage
});

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://purvanchallive.in',
      'https://www.purvanchallive.in',
    ]
  : true; // Allow all origins in development

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware - increased limits for rich news content with HTML and multiple images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static file serving for uploads with proper headers for social media crawlers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Set proper content-type for images
    if (path.match(/\.(jpg|jpeg)$/i)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.match(/\.png$/i)) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.match(/\.gif$/i)) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.match(/\.webp$/i)) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // Allow cross-origin access for social media crawlers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Routes with appropriate rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/news', publicLimiter, newsRoutes);
app.use('/api/categories', publicLimiter, categoryRoutes);
app.use('/api/marquee', publicLimiter, marqueeRoutes);

// Health check route - public access with moderate limiting
app.get('/api/health', publicLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'सर्वर चल रहा है',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'रूट नहीं मिला'
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);

  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'फाइल बहुत बड़ी है - छवियों के लिए अधिकतम 10MB और वीडियो के लिए अधिकतम 500MB अनुमत है'
    });
  }

  if (error.code === 'LIMIT_FIELD_VALUE') {
    return res.status(400).json({
      success: false,
      message: 'विवरण बहुत लंबा है - कृपया छोटा करें या कम छवियां जोड़ें'
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'बहुत सारी फाइलें अपलोड की गईं - अधिकतम 15 फाइलें अनुमत हैं'
    });
  }

  if (error.code === 'LIMIT_FIELD_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'फॉर्म डेटा बहुत बड़ा है - विवरण छोटा करें'
    });
  }

  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'फाइल अपलोड में त्रुटि: ' + error.message
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'मान्यकरण त्रुटि',
      errors: Object.values(error.errors).map((err: any) => err.message)
    });
  }

  return res.status(500).json({
    success: false,
    message: 'सर्वर त्रुटि'
  });
});

export default app;
