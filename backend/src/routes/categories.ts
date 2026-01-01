import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  validateCategory
} from '../controllers/categoryController';
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

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (Admin only)
router.use(authenticateToken);
router.use(adminLimiter);

router.post('/', validateCategory, createCategory);
router.put('/:id', validateCategory, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
