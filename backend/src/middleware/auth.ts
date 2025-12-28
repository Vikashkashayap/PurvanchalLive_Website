import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

interface AuthRequest extends Request {
  admin?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'पहुंच अस्वीकृत - टोकन आवश्यक'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as { adminId: string };

    const admin = await Admin.findById(decoded.adminId).select('+password');
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'अमान्य टोकन - व्यवस्थापक नहीं मिला'
      });
      return;
    }

    if (!admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'खाता निष्क्रिय है'
      });
      return;
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({
      success: false,
      message: 'अमान्य टोकन'
    });
  }
};

export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'प्रमाणीकरण आवश्यक'
      });
      return;
    }

    if (!roles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: 'इस कार्य के लिए अनुमति नहीं है'
      });
      return;
    }

    next();
  };
};
