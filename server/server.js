const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Root Route for testing
app.get('/', (req, res) => res.send("StoryVerse API Running"));

// Routes Mapping (Placeholders for your team)
app.use('/api/auth', require('./routes/authRoutes')); 
app.use('/api/media', require('./routes/mediaRoutes')); 
app.use('/api/ai', require('./routes/aiRoutes')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));