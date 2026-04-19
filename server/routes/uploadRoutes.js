import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import { uploadAvatar, uploadPostImage } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Upload avatar (requires authentication)
router.post('/avatar', authenticateToken, upload.single('image'), uploadAvatar);

// Upload post image (requires authentication)
router.post('/post-image', authenticateToken, upload.single('image'), uploadPostImage);

export default router;
