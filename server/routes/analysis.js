import express from 'express';
import {
  analyzeCharacter,
  getAnalysis,
  createCharacter,
  getCharacters
} from '../controllers/analysisController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/characters', createCharacter);
router.get('/characters', getCharacters);
router.post('/analyze/:characterId', analyzeCharacter);
router.get('/analysis/:characterId', getAnalysis);

export default router;
