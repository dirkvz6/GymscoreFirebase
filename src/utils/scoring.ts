import { Competitor, Event } from '../types';

export const calculateTotalScore = (scores: { [eventName: string]: number }): number => {
  return Object.values(scores).reduce((total, score) => total + score, 0);
};

export const calculateRankings = (competitors: Competitor[]): Competitor[] => {
  return competitors
    .map(competitor => ({
      ...competitor,
      totalScore: calculateTotalScore(competitor.scores)
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((competitor, index) => ({
      ...competitor,
      rank: index + 1
    }));
};

export const getEventScore = (competitor: Competitor, eventId: string): number => {
  return competitor.scores[eventId] || 0;
};

export const formatScore = (score: number): string => {
  return score.toFixed(2);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getAvailableLevels = (competitors: Competitor[]): string[] => {
  const levels = [...new Set(competitors.map(c => c.level))];
  return levels.sort((a, b) => {
    // Handle Elite level
    if (a === 'Elite') return 1;
    if (b === 'Elite') return -1;
    
    // Extract numbers from level strings
    const aNum = parseInt(a.replace('Level ', ''));
    const bNum = parseInt(b.replace('Level ', ''));
    
    return aNum - bNum;
  });
};

export const filterCompetitorsByLevel = (competitors: Competitor[], level: string | null): Competitor[] => {
  if (level === null) return competitors;
  return competitors.filter(competitor => competitor.level === level);
};