import express from 'express';
import {
  generateWhatIf,
  createTheory,
  getTheories,
  addComment,
  getDebateSummary
} from '../controllers/forumController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/whatif', generateWhatIf);
router.post('/theories', createTheory);
router.get('/theories', getTheories);
router.post('/theories/:id/comments', addComment);
router.get('/theories/:id/summary', getDebateSummary);

export default router;
