import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getCurrentProfile,
  followUser,
  unfollowUser,
  searchUsers,
  getSuggestedUsers
} from '../controllers/profileController.js';

const router = express.Router();

// Get current user's profile
router.get('/me', authenticateToken, getCurrentProfile);

// Update current user's profile
router.put('/me', authenticateToken, updateProfile);

// Get suggested users
router.get('/suggested', authenticateToken, getSuggestedUsers);

// Search users
router.get('/search', searchUsers);

// Get user profile by username
router.get('/:username', getProfile);

// Follow a user
router.post('/:username/follow', authenticateToken, followUser);

// Unfollow a user
router.delete('/:username/follow', authenticateToken, unfollowUser);

export default router;
