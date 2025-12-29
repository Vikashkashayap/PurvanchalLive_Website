import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import News from '../models/News';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  admin?: any;
}

export const validateNews = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('शीर्षक 1-200 अक्षरों के बीच होना चाहिए'),
  body('description').trim().isLength({ min: 1, max: 1000000 }).withMessage('विवरण 1-1000000 अक्षरों के बीच होना चाहिए'), // Match model validation
  body('category').isIn(['ग्राम समाचार', 'राजनीति', 'शिक्षा', 'मौसम', 'स्वास्थ्य', 'कृषि', 'मनोरंजन', 'अन्य']).withMessage('अमान्य श्रेणी')
];

export const getAllNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;

    const query: any = {};

    // Only show published news for public access
    if (!req.admin) {
      query.isPublished = true;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await News.countDocuments(query);

    // Validate image URLs - remove news items with missing images
    const validatedNews = news.filter(item => {
      if (item.imageUrl) {
        // Check if the image file exists
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../../uploads', item.imageUrl.replace('/uploads/', ''));
        return fs.existsSync(imagePath);
      }
      return true; // Keep items without images
    });

    res.status(200).json({
      success: true,
      data: {
        news: validatedNews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const getNewsById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query: any = { _id: id };

    // Only show published news for public access
    if (!req.admin) {
      query.isPublished = true;
    }

    const news = await News.findOne(query);

    if (!news) {
      res.status(404).json({
        success: false,
        message: 'समाचार नहीं मिला'
      });
      return;
    }

    // Validate image URL - clear it if the file doesn't exist
    if (news.imageUrl) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '../../uploads', news.imageUrl.replace('/uploads/', ''));
      if (!fs.existsSync(imagePath)) {
        news.imageUrl = ''; // Clear the image URL if file doesn't exist
      }
    }

    res.status(200).json({
      success: true,
      data: news
    });

  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { title, description, category, videoUrl, isPublished } = req.body;

    // Handle image upload
    let imageUrl = '';
    if (req.files && 'image' in req.files && req.files.image[0]) {
      imageUrl = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle video file upload
    let videoFileUrl = '';
    if (req.files && 'videoFile' in req.files && req.files.videoFile[0]) {
      videoFileUrl = `/uploads/${req.files.videoFile[0].filename}`;
    }

    const news = new News({
      title,
      description,
      category,
      videoUrl: videoUrl || '',
      videoFileUrl,
      imageUrl,
      isPublished: isPublished || false
    });

    const savedNews = await news.save();

    res.status(201).json({
      success: true,
      message: 'समाचार सफलतापूर्वक बनाया गया',
      data: savedNews
    });

  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const { title, description, category, videoUrl, isPublished } = req.body;

    const news = await News.findById(id);
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'समाचार नहीं मिला'
      });
      return;
    }

    // Handle image upload - remove old image if new one is uploaded
    let imageUrl = news.imageUrl;
    if (req.files && 'image' in req.files && req.files.image[0]) {
      // Delete old image file
      if (news.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../', news.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle video file upload - remove old video file if new one is uploaded
    let videoFileUrl = news.videoFileUrl;
    if (req.files && 'videoFile' in req.files && req.files.videoFile[0]) {
      // Delete old video file
      if (news.videoFileUrl) {
        const oldVideoPath = path.join(__dirname, '../../', news.videoFileUrl);
        if (fs.existsSync(oldVideoPath)) {
          fs.unlinkSync(oldVideoPath);
        }
      }
      videoFileUrl = `/uploads/${req.files.videoFile[0].filename}`;
    }

    const updatedNews = await News.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        videoUrl: videoUrl || '',
        videoFileUrl,
        imageUrl,
        isPublished: isPublished !== undefined ? isPublished : news.isPublished
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'समाचार सफलतापूर्वक अपडेट किया गया',
      data: updatedNews
    });

  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};

export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'समाचार नहीं मिला'
      });
      return;
    }

    // Delete associated image file
    if (news.imageUrl) {
      const imagePath = path.join(__dirname, '../../', news.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete associated video file
    if (news.videoFileUrl) {
      const videoPath = path.join(__dirname, '../../', news.videoFileUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await News.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'समाचार सफलतापूर्वक हटाया गया'
    });

  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'सर्वर त्रुटि'
    });
  }
};
