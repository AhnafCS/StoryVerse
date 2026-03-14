import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  characterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Character'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  mbti: {
    type: String,
    required: true
  },
  moralAlignment: {
    type: String,
    required: true
  },
  scores: {
    leadership: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    antagonistPotential: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    emotionalStability: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    }
  },
  traits: {
    strengths: [{
      type: String
    }],
    weaknesses: [{
      type: String
    }]
  },
  motivation: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Analysis', analysisSchema);
