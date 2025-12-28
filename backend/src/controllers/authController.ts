import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin';

// Extend Request interface to include admin property
interface AuthRequest extends Request {
  admin?: any;
}

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('मान्य ईमेल दर्ज करें'),
  body('password').notEmpty().withMessage('पासवर्ड आवश्यक है')
];

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'मान्यकरण त्रुटि',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'अमान्य ईमेल या पासवर्ड'
      });
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'खाता निष्क्रिय है'
      });
      return;
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'अमान्य ईमेल या पासवर्ड'
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { adminId: admin._id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(200).json({
      success: true,
      message: 'लॉगिन सफल',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin = req.admin;

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};
