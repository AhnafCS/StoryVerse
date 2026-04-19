import { GoogleGenerativeAI } from '@google/generative-ai';
import Analysis from '../models/Analysis.js';
import Character from '../models/Character.js';

let genAI = null;
let model = null;

const getModel = () => {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `Analyze the character description provided. You must return a JSON-only response with this exact structure:
{
  "mbti": "MBTI type (e.g., INTJ, ENFP)",
  "moralAlignment": "D&D alignment (e.g., Lawful Good, Chaotic Neutral)",
  "scores": {
    "leadership": number (1-100),
    "antagonistPotential": number (1-100),
    "emotionalStability": number (1-100)
  },
  "traits": {
    "strengths": ["array of strength strings"],
    "weaknesses": ["array of weakness strings"]
  },
  "motivation": "primary motivation description"
}
Do not include any other text, markdown, or explanations. Return valid JSON only.`,
    });
  }
  return model;
};

export const analyzeCharacter = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.userId;

    const character = await Character.findOne({ _id: characterId, userId });
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const existingAnalysis = await Analysis.findOne({ characterId, userId });
    if (existingAnalysis) {
      return res.json({
        message: 'Analysis already exists',
        analysis: existingAnalysis
      });
    }

    const prompt = `Analyze this character: ${character.name}. Description: ${character.description}`;
    
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    let parsedData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : response;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

    const analysis = new Analysis({
      characterId,
      userId,
      mbti: parsedData.mbti,
      moralAlignment: parsedData.moralAlignment,
      scores: {
        leadership: parsedData.scores?.leadership || 50,
        antagonistPotential: parsedData.scores?.antagonistPotential || 50,
        emotionalStability: parsedData.scores?.emotionalStability || 50
      },
      traits: {
        strengths: parsedData.traits?.strengths || [],
        weaknesses: parsedData.traits?.weaknesses || []
      },
      motivation: parsedData.motivation || 'Unknown'
    });

    await analysis.save();

    res.status(201).json({
      message: 'Character analysis complete',
      analysis
    });
  } catch (error) {
    console.error('Analysis error details:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to analyze character: ' + error.message });
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.userId;

    const analysis = await Analysis.findOne({ characterId, userId });
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve analysis' });
  }
};

export const createCharacter = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    const character = new Character({
      name,
      description,
      userId
    });

    await character.save();

    res.status(201).json({
      message: 'Character created',
      character
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create character' });
  }
};

export const getCharacters = async (req, res) => {
  try {
    const userId = req.user.userId;
    const characters = await Character.find({ userId });
    res.json({ characters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve characters' });
  }
};
