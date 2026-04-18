import mongoose from 'mongoose';

const narrativePhaseSchema = new mongoose.Schema({
  phase: { type: String, required: true },         // e.g. "Act I", "Rising Action"
  sentimentScore: { type: Number, min: -1, max: 1 }, // -1 (negative) to +1 (positive)
  emotionalIntensity: { type: Number, min: 0, max: 100 },
  description: { type: String }
}, { _id: false });

const relationshipSchema = new mongoose.Schema({
  source: { type: String, required: true },        // character name
  target: { type: String, required: true },        // character name
  type: {
    type: String,
    enum: ['friendship', 'rivalry', 'romance', 'mentor', 'conflict', 'neutral'],
    required: true
  },
  strength: { type: Number, min: 1, max: 10 }
}, { _id: false });

const narrativeSchema = new mongoose.Schema({
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

  // Feature 1 & 2: Growth arc phases + emotional intensity per phase
  growthArc: [narrativePhaseSchema],

  // Feature 3: Relationship network
  relationships: [relationshipSchema],

  // Feature 4: Story structure
  storyStructure: {
    type: {
      type: String   // e.g. "Hero's Journey", "Tragedy", "Redemption Arc"
    },
    description: { type: String },
    keyMoments: [{ type: String }]
  },

  // Feature 5: Themes + conflict intensity
  themeAnalysis: {
    recurringThemes: [{ type: String }],
    conflictIntensity: { type: Number, min: 0, max: 100 },
    conflictDescription: { type: String }
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Narrative', narrativeSchema);
