import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getMarqueeContent,
  createMarqueeContent,
  updateMarqueeContent,
  deleteMarqueeContent,
  validateMarqueeContent
} from '../controllers/marqueeController';
import { authenticateToken } from '../middleware/auth';

// Admin operations limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes
  message: {
    success: false,
    message: 'बहुत सारे अनुरोध, कृपया बाद में प्रयास करें'
  }
});

const router = express.Router();

// Public routes - anyone can view marquee content
router.get('/', getMarqueeContent);

// Protected routes (Admin only)
router.use(authenticateToken);
router.use(adminLimiter);

router.post('/', validateMarqueeContent, createMarqueeContent);
router.put('/:id', validateMarqueeContent, updateMarqueeContent);
router.delete('/:id', deleteMarqueeContent);

export default router;
