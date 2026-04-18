const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  creator: { type: String },
  releaseYear: { type: Number },
  summary: { type: String },
  genres: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
