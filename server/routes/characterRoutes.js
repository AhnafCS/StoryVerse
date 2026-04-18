import express from 'express';
import { createCharacter, getCharactersByMedia, deleteCharacter } from '../controllers/characterController.js';

const router = express.Router();

router.post('/add', createCharacter);
router.get('/:mediaId', getCharactersByMedia);
router.delete('/:id', deleteCharacter);

export default router;