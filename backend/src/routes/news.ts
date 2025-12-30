import express from 'express';
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
import { uploadNewsFiles, uploadSingleImage, extractBase64Images } from '../middleware/upload';

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

// POST /api/news/upload-image (for rich text editor)
router.post('/upload-image', uploadSingleImage, (req: express.Request, res: express.Response): any => {
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

// POST /api/news
router.post('/', uploadNewsFiles, extractBase64Images, validateNews, createNews);

// PUT /api/news/:id
router.put('/:id', uploadNewsFiles, extractBase64Images, validateNews, updateNews);

// DELETE /api/news/:id
router.delete('/:id', deleteNews);

export default router;
