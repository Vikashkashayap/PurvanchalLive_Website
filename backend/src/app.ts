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

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'बहुत सारे अनुरोध, कृपया बाद में प्रयास करें'
  }
});
app.use(limiter);

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

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/marquee', marqueeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
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
