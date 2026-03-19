import { GoogleGenerativeAI } from '@google/generative-ai';
import Narrative from '../models/Narrative.js';
import Character from '../models/Character.js';

let genAI = null;
let model = null;

const getModel = () => {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
};

const parseJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text);
};

// ─── POST /api/narrative/:characterId  (generate & save) ──────────────────────
export const generateNarrative = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.userId;

    const character = await Character.findOne({ _id: characterId, userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Return cached result if exists
    const existing = await Narrative.findOne({ characterId, userId });
    if (existing) return res.json({ message: 'Narrative already exists', narrative: existing });

    const ai = getModel();

    // ── Prompt: all 5 features in one call ────────────────────────────────────
    const prompt = `
You are a narrative intelligence engine. Analyze this character and their story:

Character Name: ${character.name}
Description: ${character.description}

Return ONLY a single valid JSON object with this exact structure (no markdown, no extra text):
{
  "growthArc": [
    {
      "phase": "phase name (e.g. Origin, Rising Conflict, Turning Point, Climax, Resolution)",
      "sentimentScore": <number between -1.0 and 1.0>,
      "emotionalIntensity": <number between 0 and 100>,
      "description": "1-2 sentence description of what happens in this phase"
    }
  ],
  "relationships": [
    {
      "source": "${character.name}",
      "target": "character name",
      "type": "one of: friendship | rivalry | romance | mentor | conflict | neutral",
      "strength": <number 1-10>
    }
  ],
  "storyStructure": {
    "type": "one of: Hero's Journey | Tragedy | Redemption Arc | Coming of Age | Revenge Arc | Fallen Hero | Anti-Hero's Path",
    "description": "2-3 sentence explanation of why this structure fits",
    "keyMoments": ["moment 1", "moment 2", "moment 3"]
  },
  "themeAnalysis": {
    "recurringThemes": ["theme1", "theme2", "theme3", "theme4"],
    "conflictIntensity": <number 0-100>,
    "conflictDescription": "1-2 sentences describing the nature of conflicts"
  }
}

Rules:
- growthArc must have exactly 5 phases in chronological order
- relationships must include 3-6 other characters inferred from the description
- Be specific and insightful, not generic
- sentimentScore: negative = dark/suffering, positive = growth/triumph
`;

    const result = await ai.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = parseJSON(text);
    } catch {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

    const narrative = new Narrative({
      characterId,
      userId,
      growthArc: parsed.growthArc || [],
      relationships: parsed.relationships || [],
      storyStructure: parsed.storyStructure || {},
      themeAnalysis: parsed.themeAnalysis || {}
    });

    await narrative.save();
    res.status(201).json({ message: 'Narrative analysis complete', narrative });

  } catch (error) {
    console.error('Narrative error:', error.message);
    res.status(500).json({ error: 'Failed to generate narrative: ' + error.message });
  }
};

// ─── GET /api/narrative/:characterId  (fetch saved) ───────────────────────────
export const getNarrative = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.userId;

    const narrative = await Narrative.findOne({ characterId, userId });
    if (!narrative) return res.status(404).json({ error: 'Narrative not found' });

    res.json({ narrative });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve narrative' });
  }
};

// ─── DELETE /api/narrative/:characterId  (regenerate: clear cache) ────────────
export const deleteNarrative = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.userId;

    await Narrative.deleteOne({ characterId, userId });
    res.json({ message: 'Narrative cleared. You can now regenerate.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete narrative' });
  }
};
