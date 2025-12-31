import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Upload to the uploads folder in the project root
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, basename + '-' + uniqueSuffix + extension);
  }
});

// File filter for images and videos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'image') {
    // Check for image files
    const extnameValid = allowedImageTypes.test(extname);
    const mimetypeValid = allowedImageTypes.test(mimetype);

    if (mimetypeValid && extnameValid) {
      return cb(null, true);
    } else {
      cb(new Error('केवल छवि फाइलें अनुमत हैं (jpeg, jpg, png, gif, webp)'));
    }
  } else if (file.fieldname === 'videoFile') {
    // Check for video files
    const extnameValid = allowedVideoTypes.test(extname);
    const mimetypeValid = mimetype.startsWith('video/');

    if (mimetypeValid && extnameValid) {
      return cb(null, true);
    } else {
      cb(new Error('केवल वीडियो फाइलें अनुमत हैं (mp4, avi, mov, wmv, flv, webm, mkv)'));
    }
  } else {
    cb(new Error('अमान्य फाइल प्रकार'));
  }
};

// Upload middleware with high file size limit for mixed content
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2147483648, // 2GB limit (very high to allow large videos)
    fieldSize: 20971520   // 20MB limit for text fields (description, etc.)
  },
  fileFilter: fileFilter
});

// Upload middleware for images with 5MB limit (for rich text editor)
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5242880, // 5MB limit for images
    fieldSize: 20971520 // 20MB limit for text fields
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check for image files only
    const extnameValid = allowedImageTypes.test(extname);
    const mimetypeValid = allowedImageTypes.test(mimetype);

    if (mimetypeValid && extnameValid) {
      return cb(null, true);
    } else {
      cb(new Error('केवल छवि फाइलें अनुमत हैं (jpeg, jpg, png, gif, webp) और अधिकतम 5MB'));
    }
  }
});

// Single image upload
export const uploadSingle = upload.single('image');

// Single image upload with 5MB limit (for rich text editor)
export const uploadSingleImage = uploadImage.single('image');

// Single video upload
export const uploadVideo = upload.single('videoFile');

// Multiple images upload (if needed)
export const uploadMultiple = upload.array('images', 10);

// Combined upload for news (featured image + video + content images)
export const uploadNewsFiles = upload.fields([
  { name: 'featuredImage', maxCount: 1 }, // Featured image (single)
  { name: 'contentImages', maxCount: 10 }, // Content images (multiple, up to 10)
  { name: 'videoFile', maxCount: 1 }
]);

// Production-ready news upload with higher limits for videos
export const uploadNewsFilesLarge = multer({
  storage: storage,
  limits: {
    fileSize: 524288000, // 500MB total limit (allows large videos)
    fieldSize: 20971520, // 20MB for text fields (handles large HTML)
    files: 15 // Maximum 15 files total (1 featured + 10 content + 1 video + buffer)
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Check based on field name
    if (file.fieldname === 'featuredImage' || file.fieldname === 'image' || file.fieldname === 'contentImages') {
      // Image files (including backward compatibility for 'image' field)
      const extnameValid = allowedImageTypes.test(extname);
      const mimetypeValid = allowedImageTypes.test(mimetype);

      if (mimetypeValid && extnameValid) {
        return cb(null, true);
      } else {
        cb(new Error('केवल छवि फाइलें अनुमत हैं (jpeg, jpg, png, gif, webp)'));
      }
    } else if (file.fieldname === 'videoFile') {
      // Video files
      const extnameValid = allowedVideoTypes.test(extname);
      const mimetypeValid = mimetype.startsWith('video/');

      if (mimetypeValid && extnameValid) {
        return cb(null, true);
      } else {
        cb(new Error('केवल वीडियो फाइलें अनुमत हैं (mp4, avi, mov, wmv, flv, webm, mkv)'));
      }
    } else {
      cb(new Error('अमान्य फाइल प्रकार'));
    }
  }
}).fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }, // Backward compatibility - old field name
  { name: 'contentImages', maxCount: 10 },
  { name: 'videoFile', maxCount: 1 }
]);

// Middleware to extract base64 images from description and save them as files
export const extractBase64Images = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.body.description && typeof req.body.description === 'string') {
      const base64ImageRegex = /<img[^>]+src="data:image\/([a-zA-Z]+);base64,([^"]+)"/g;
      let description = req.body.description;
      let match;
      let imageCount = 0;

      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      while ((match = base64ImageRegex.exec(description)) !== null) {
        const imageType = match[1]; // e.g., 'png', 'jpeg'
        const base64Data = match[2];

        if (!base64Data) continue; // Skip if no base64 data

        const extension = imageType === 'jpeg' ? 'jpg' : imageType;

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + imageCount;
        const filename = `base64-image-${uniqueSuffix}.${extension}`;
        const filepath = path.join(uploadsDir, filename);

        // Convert base64 to buffer and save
        const imageBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filepath, imageBuffer);

        // Replace base64 src with file URL
        const imageUrl = `/uploads/${filename}`;
        const oldImgTag = match[0];
        const newImgTag = oldImgTag.replace(/src="data:image\/[^"]+"/, `src="${imageUrl}"`);

        description = description.replace(oldImgTag, newImgTag);
        imageCount++;
      }

      // Update the description in the request body
      req.body.description = description;
    }

    next();
  } catch (error) {
    console.error('Error extracting base64 images:', error);
    res.status(500).json({
      success: false,
      message: 'छवि प्रसंस्करण में त्रुटि'
    });
  }
};
