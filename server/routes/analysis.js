import express from 'express';
import {
  analyzeCharacter,
  getAnalysis,
  createCharacter,
  getCharacters
} from '../controllers/analysisController.js';
import {
  generateNarrative,
  getNarrative,
  deleteNarrative
} from '../controllers/narrativeController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// ── Existing Requirement 2 routes ─────────────────────────────────────────────
router.post('/characters', createCharacter);
router.get('/characters', getCharacters);
router.post('/analyze/:characterId', analyzeCharacter);
router.get('/analysis/:characterId', getAnalysis);

// ── Requirement 3: Narrative & Growth Visualization ───────────────────────────
router.post('/narrative/:characterId', generateNarrative);   // generate & save
router.get('/narrative/:characterId', getNarrative);          // fetch saved
router.delete('/narrative/:characterId', deleteNarrative);    // clear cache (regenerate)

export default router;
