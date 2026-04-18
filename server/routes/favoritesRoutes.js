import express from 'express';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoritesController.js';

const router = express.Router();

router.post('/:userId', addFavorite);
router.get('/:userId', getFavorites);
router.delete('/:userId', removeFavorite);

export default router;