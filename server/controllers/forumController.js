import { GoogleGenerativeAI } from '@google/generative-ai';
import Theory from '../models/Theory.js';
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
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
};

// 1. "What If" Scenario Generator
export const generateWhatIf = async (req, res) => {
  try {
    const { characterId, scenario } = req.body;
    const userId = req.user.userId;

    const character = await Character.findOne({ _id: characterId, userId });
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const ai = getModel();
    const prompt = `Based on this character: ${character.name} (Description: ${character.description}). Generate a plausible alternate plot branch for this scenario: "What if ${scenario}?". Make it creative, engaging, and in character. Limit to 3 short paragraphs.`;

    const result = await ai.generateContent(prompt);
    const text = result.response.text();

    res.json({ scenarioResult: text });
  } catch (error) {
    console.error('What-If error:', error);
    res.status(500).json({ error: 'Failed to generate scenario' });
  }
};

// 2. AI Theory Evaluation & Forum Posting
export const createTheory = async (req, res) => {
  try {
    const { title, content, characterId } = req.body;
    const userId = req.user.userId;

    // AI Evaluation
    const ai = getModel();
    const prompt = `Evaluate this fan theory for logical strength and consistency.
Title: ${title}
Theory: ${content}
Provide a JSON response with:
{
  "logicalStrength": number (1-100),
  "consistency": number (1-100),
  "feedback": "Short constructive feedback"
}
Return ONLY valid JSON, no markdown formatting.`;

    const result = await ai.generateContent(prompt);
    const responseText = result.response.text();
    
    let evaluationData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      evaluationData = JSON.parse(jsonString);
    } catch (parseError) {
      evaluationData = { logicalStrength: 50, consistency: 50, feedback: "Unable to parse AI evaluation." };
    }

    const theory = new Theory({
      title,
      content,
      characterId: characterId || null,
      userId,
      aiEvaluation: evaluationData
    });

    await theory.save();
    
    // Populate user info before returning
    await theory.populate('userId', 'username');

    res.status(201).json({ theory });
  } catch (error) {
    console.error('Theory creation error:', error);
    res.status(500).json({ error: 'Failed to create theory' });
  }
};

// 3. Get Theories (Forum)
export const getTheories = async (req, res) => {
  try {
    const theories = await Theory.find()
      .populate('userId', 'username')
      .populate('comments.userId', 'username')
      .sort({ createdAt: -1 });
    res.json({ theories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch theories' });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const theory = await Theory.findById(id);
    if (!theory) {
      return res.status(404).json({ error: 'Theory not found' });
    }

    theory.comments.push({ userId, content });
    
    // Reset AI summary when new comments are added
    theory.aiSummary = null;
    await theory.save();
    
    await theory.populate('comments.userId', 'username');

    res.json({ theory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// 4. AI Debate Summary
export const getDebateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const theory = await Theory.findById(id).populate('comments.userId', 'username');
    
    if (!theory) {
      return res.status(404).json({ error: 'Theory not found' });
    }

    // Return existing summary if no new comments or already summarized
    // For simplicity, we just generate a new one each time they ask, or cache it.
    if (theory.aiSummary && theory.comments.length > 0) {
       // but wait, earlier we reset aiSummary to null when comments are added.
       // So if we have it, it's up to date.
       return res.json({ summary: theory.aiSummary });
    }

    if (theory.comments.length === 0) {
      return res.json({ summary: "No discussion to summarize yet." });
    }

    const commentTexts = theory.comments.map(c => `${c.userId.username}: ${c.content}`).join('\n');
    
    const ai = getModel();
    const prompt = `Summarize the following debate/discussion on a fan theory. Provide a completely unbiased overview of the main points discussed. Keep it concise (1-2 paragraphs).
Theory Title: ${theory.title}
Theory Content: ${theory.content}
Comments:
${commentTexts}`;

    const result = await ai.generateContent(prompt);
    theory.aiSummary = result.response.text();
    await theory.save();

    res.json({ summary: theory.aiSummary });
  } catch (error) {
    console.error('Debate summary error:', error);
    res.status(500).json({ error: 'Failed to summarize debate' });
  }
};
