import express from 'express';
import {
  getMarqueeContent,
  createMarqueeContent,
  updateMarqueeContent,
  deleteMarqueeContent,
  validateMarqueeContent
} from '../controllers/marqueeController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes - anyone can view marquee content
router.get('/', getMarqueeContent);

// Protected routes (Admin only)
router.use(authenticateToken);

router.post('/', validateMarqueeContent, createMarqueeContent);
router.put('/:id', validateMarqueeContent, updateMarqueeContent);
router.delete('/:id', deleteMarqueeContent);

export default router;
