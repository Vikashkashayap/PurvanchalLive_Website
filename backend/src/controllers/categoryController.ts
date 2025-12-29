import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category';

export const validateCategory = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('नाम 1-50 अक्षरों के बीच होना चाहिए'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('विवरण 200 अक्षरों से कम होना चाहिए')
];

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Category.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'श्रेणी नहीं मिली'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
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

    const { name, description } = req.body;

    const category = new Category({
      name,
      description
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      message: 'श्रेणी सफलतापूर्वक बनाई गई',
      data: savedCategory
    });

  } catch (error: any) {
    console.error('Create category error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'यह श्रेणी पहले से मौजूद है'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
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

    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'श्रेणी नहीं मिली'
      });
      return;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'श्रेणी सफलतापूर्वक अपडेट की गई',
      data: updatedCategory
    });

  } catch (error: any) {
    console.error('Update category error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'यह श्रेणी पहले से मौजूद है'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'श्रेणी नहीं मिली'
      });
      return;
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'श्रेणी सफलतापूर्वक हटाई गई'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};
