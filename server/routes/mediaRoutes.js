const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

router.post('/add', mediaController.createMedia);
router.get('/', mediaController.getAllMedia);

module.exports = router;
