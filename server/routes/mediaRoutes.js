import express from 'express';
import { createMedia, getAllMedia, getMediaById } from '../controllers/mediaController.js';

const router = express.Router();

router.post('/add', createMedia);
router.get('/', getAllMedia);
router.get('/:id', getMediaById);

export default router;