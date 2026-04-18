import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createPost,
  getPosts,
  getPost,
  toggleLike,
  addComment,
  deleteComment,
  deletePost,
  getUserPosts
} from '../controllers/postController.js';

const router = express.Router();

// Create a new post
router.post('/', authenticateToken, createPost);

// Get posts (feed)
router.get('/', getPosts);

// Get a single post
router.get('/:postId', getPost);

// Like/unlike a post
router.post('/:postId/like', authenticateToken, toggleLike);

// Add a comment to a post
router.post('/:postId/comments', authenticateToken, addComment);

// Delete a comment
router.delete('/:postId/comments/:commentId', authenticateToken, deleteComment);

// Delete a post
router.delete('/:postId', authenticateToken, deletePost);

// Get user's posts
router.get('/user/:username', getUserPosts);

export default router;
