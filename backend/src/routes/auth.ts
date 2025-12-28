import express from 'express';
import { login, getProfile, validateLogin } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/profile (protected)
router.get('/profile', authenticateToken, getProfile);

export default router;
