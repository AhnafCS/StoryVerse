import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  creator: { type: String },
  releaseYear: { type: Number },
  summary: { type: String },
  genres: [{ type: String }],
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);
