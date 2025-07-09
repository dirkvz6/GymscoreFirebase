import React from 'react';
import { Competitor, Event } from '../types';
import { calculateRankings } from '../utils/scoring';
import CompetitorCard from './CompetitorCard';
import CompetitorTable from './CompetitorTable';
import { Trophy, Medal, Award } from 'lucide-react';

interface LevelGroupedResultsProps {
  competitors: Competitor[];
  events: Event[];
  viewMode: 'cards' | 'table';
  onEditScore: (competitor: Competitor, event: Event) => void;
}

const LevelGroupedResults: React.FC<LevelGroupedResultsProps> = ({
  competitors,
  events,
  viewMode,
  onEditScore
}) => {
  // Group competitors by level
  const competitorsByLevel = competitors.reduce((groups, competitor) => {
    const level = competitor.level;
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(competitor);
    return groups;
  }, {} as Record<string, Competitor[]>);

  // Sort levels in a logical order
  const sortedLevels = Object.keys(competitorsByLevel).sort((a, b) => {
    // Handle Elite level
    if (a === 'Elite') return 1;
    if (b === 'Elite') return -1;
    
    // Extract numbers from level strings
    const aNum = parseInt(a.replace('Level ', ''));
    const bNum = parseInt(b.replace('Level ', ''));
    
    return aNum - bNum;
  });

  const getLevelIcon = (level: string) => {
    if (level === 'Elite') return <Trophy className="w-5 h-5 text-yellow-500" />;
    const levelNum = parseInt(level.replace('Level ', ''));
    if (levelNum >= 8) return <Medal className="w-5 h-5 text-purple-500" />;
    if (levelNum >= 5) return <Medal className="w-5 h-5 text-blue-500" />;
    return <Award className="w-5 h-5 text-green-500" />;
  };

  const getLevelColor = (level: string) => {
    if (level === 'Elite') return 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50';
    const levelNum = parseInt(level.replace('Level ', ''));
    if (levelNum >= 8) return 'border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50';
    if (levelNum >= 5) return 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50';
    return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
  };

  if (sortedLevels.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No competitors found</h3>
        <p className="text-gray-600">Add competitors to see results grouped by level</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedLevels.map(level => {
        const levelCompetitors = calculateRankings(competitorsByLevel[level]);
        
        return (
          <div key={level} className={`border-2 rounded-2xl p-6 ${getLevelColor(level)}`}>
            <div className="flex items-center space-x-3 mb-6">
              {getLevelIcon(level)}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{level}</h3>
                <p className="text-sm text-gray-600">
                  {levelCompetitors.length} competitor{levelCompetitors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {levelCompetitors.map((competitor) => (
                  <CompetitorCard
                    key={competitor.id}
                    competitor={competitor}
                    events={events}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/50 rounded-xl overflow-hidden">
                <CompetitorTable
                  competitors={levelCompetitors}
                  events={events}
                  onEditScore={onEditScore}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LevelGroupedResults;