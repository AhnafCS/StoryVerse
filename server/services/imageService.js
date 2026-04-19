import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base uploads directory
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure subdirectories exist
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const POSTS_DIR = path.join(UPLOADS_DIR, 'posts');

if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

/**
 * Upload an image file and return a URL
 * @param {Object} file - The multer file object
 * @param {string} type - 'avatars' or 'posts'
 * @returns {string} - The URL to access the image
 */
export const uploadImage = async (file, type = 'posts') => {
  try {
    const targetDir = type === 'avatars' ? AVATARS_DIR : POSTS_DIR;
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname) || '.jpg';
    const filename = `${type}_${timestamp}_${randomString}${extension}`;
    
    const filepath = path.join(targetDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);
    
    // Return the URL (relative path that will be served statically)
    return `/uploads/${type}/${filename}`;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to save image');
  }
};

/**
 * Delete an image file
 * @param {string} imageUrl - The URL/path of the image to delete
 */
export const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      return;
    }
    
    const filepath = path.join(UPLOADS_DIR, '..', imageUrl);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    // Don't throw - deletion failures shouldn't break other operations
  }
};
