import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  background: { type: String },
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true }
}, { timestamps: true });

export default mongoose.model('Character', characterSchema);