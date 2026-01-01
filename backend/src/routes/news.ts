import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  validateNews
} from '../controllers/newsController';
import { authenticateToken } from '../middleware/auth';
import { uploadNewsFilesLarge, uploadSingleImage, extractBase64Images } from '../middleware/upload';

// Admin operations limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes
  message: {
    success: false,
    message: 'बहुत सारे अनुरोध, कृपया बाद में प्रयास करें'
  }
});

// Heavy operations limiter (uploads)
const heavyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    success: false,
    message: 'बहुत सारे अनुरोध, कृपया बाद में प्रयास करें'
  }
});

const router = express.Router();

// Public routes
// GET /api/news
router.get('/', getAllNews);

// GET /api/news/:id
router.get('/:id', getNewsById);

// GET /api/news/slug/:slug
router.get('/slug/:slug', getNewsBySlug);

// Protected routes (Admin only)
router.use(authenticateToken);
router.use(adminLimiter);

// POST /api/news/upload-image (for rich text editor) - heavy operation
router.post('/upload-image', heavyLimiter, uploadSingleImage, (req: express.Request, res: express.Response): any => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'कोई फाइल अपलोड नहीं हुई'
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'छवि सफलतापूर्वक अपलोड हुई',
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'छवि अपलोड में त्रुटि'
    });
  }
});

// POST /api/news - heavy operation due to file uploads
router.post('/', heavyLimiter, uploadNewsFilesLarge, extractBase64Images, validateNews, createNews);

// PUT /api/news/:id - heavy operation due to file uploads
router.put('/:id', heavyLimiter, uploadNewsFilesLarge, extractBase64Images, validateNews, updateNews);

// DELETE /api/news/:id
router.delete('/:id', deleteNews);

export default router;
