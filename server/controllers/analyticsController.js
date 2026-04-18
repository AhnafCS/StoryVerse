import Analysis from '../models/Analysis.js';
import Character from '../models/Character.js';

export const getPersonalAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Most Analyzed Characters
    // Since each analysis is tied to a character, we can group by characterId.
    const mostAnalyzed = await Analysis.aggregate([
      { $match: { userId: userId /* Need ObjectId casting if stored as string, but mongoose usually handles or we can convert */ } },
      { $group: { _id: '$characterId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'characters', localField: '_id', foreignField: '_id', as: 'character' } },
      { $unwind: '$character' }
    ]).exec();
    
    // In our simplified version, maybe each character only has one analysis. 
    // Wait, Analysis is 1:1 with CharacterId in `analysisController.js`.
    // Let's just fetch all analyses for the user directly.
    
    const userAnalyses = await Analysis.find({ userId }).populate('characterId');
    const totalAnalyses = userAnalyses.length;

    // Calculate Averages
    let totalLeadership = 0;
    let totalAntagonist = 0;
    let totalEmotional = 0;
    
    // Count moral alignments
    const alignmentCounts = {};

    userAnalyses.forEach(analysis => {
      totalLeadership += analysis.scores.leadership;
      totalAntagonist += analysis.scores.antagonistPotential;
      totalEmotional += analysis.scores.emotionalStability;
      
      const alignment = analysis.moralAlignment || 'Unknown';
      alignmentCounts[alignment] = (alignmentCounts[alignment] || 0) + 1;
    });

    const avgScores = totalAnalyses > 0 ? {
      leadership: Math.round(totalLeadership / totalAnalyses),
      antagonistPotential: Math.round(totalAntagonist / totalAnalyses),
      emotionalStability: Math.round(totalEmotional / totalAnalyses)
    } : { leadership: 0, antagonistPotential: 0, emotionalStability: 0 };

    // Moral Ambiguity Index (e.g., higher antagonist potential and neutral alignments)
    // We'll use the avg antagonist potential as the moral ambiguity index for simplicity.
    const moralAmbiguityIndex = avgScores.antagonistPotential;

    // Emotional Complexity Ranking
    const emotionalComplexity = avgScores.emotionalStability < 50 ? 'High' : (avgScores.emotionalStability < 75 ? 'Moderate' : 'Low');

    res.json({
      analytics: {
        totalAnalyses,
        avgScores,
        moralAmbiguityIndex,
        emotionalComplexity,
        alignment分布: Object.keys(alignmentCounts).map(k => ({ name: k, value: alignmentCounts[k] })),
        characters: userAnalyses.map(a => ({
          name: a.characterId?.name || 'Unknown',
          mbti: a.mbti,
          moralAlignment: a.moralAlignment
        }))
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch personal analytics' });
  }
};
