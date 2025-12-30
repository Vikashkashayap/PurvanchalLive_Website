import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { MarqueeContent } from '../models/News';

interface AuthRequest extends Request {
  admin?: any;
}

// Marquee Content Management Functions
export const validateMarqueeContent = [
  body('content').trim().isLength({ min: 1, max: 300 }).withMessage('Content must be between 1-300 characters'),
  body('type').isIn(['breaking', 'announcement']).withMessage('Type must be either breaking or announcement'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
];

export const getMarqueeContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    const query: any = { isActive: true };

    if (type && (type === 'breaking' || type === 'announcement')) {
      query.type = type;
    }

    const marqueeContent = await MarqueeContent.find(query)
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: marqueeContent
    });
  } catch (error) {
    console.error('Error fetching marquee content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const createMarqueeContent = async (req: AuthRequest, res: Response):Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
      return;
    }

    const { content, type, isActive, order } = req.body;

    const marqueeContent = new MarqueeContent({
      content: content.trim(),
      type,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    const savedContent = await marqueeContent.save();

    res.status(201).json({
      success: true,
      message: 'Marquee content created successfully',
      data: savedContent
    });
  } catch (error) {
    console.error('Error creating marquee content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateMarqueeContent = async (req: AuthRequest, res: Response):Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { content, type, isActive, order } = req.body;

    const updatedContent = await MarqueeContent.findByIdAndUpdate(
      id,
      {
        content: content?.trim(),
        type,
        isActive,
        order
      },
      { new: true, runValidators: true }
    );

    if (!updatedContent) {
      res.status(404).json({
        success: false,
        message: 'Marquee content not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Marquee content updated successfully',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating marquee content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deleteMarqueeContent = async (req: AuthRequest, res: Response):Promise<void> => {
  try {
    const { id } = req.params;

    const deletedContent = await MarqueeContent.findByIdAndDelete(id);

    if (!deletedContent) {
      res.status(404).json({
        success: false,
        message: 'Marquee content not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Marquee content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting marquee content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
