import express from 'express';
import { getPersonalAnalytics } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/personal', getPersonalAnalytics);

export default router;
