import React from 'react';
import { Competitor, Event } from '../types';
import { formatScore } from '../utils/scoring';
import { Medal, Trophy, Star } from 'lucide-react';

interface CompetitorCardProps {
  competitor: Competitor;
  events: Event[];
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor, events }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <div className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getRankStyle(competitor.rank)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getRankIcon(competitor.rank)}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{competitor.name}</h3>
            <p className="text-sm text-gray-600">{competitor.team} • {competitor.level}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{formatScore(competitor.totalScore)}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {events.map(event => (
          <div key={event.id} className="bg-white/50 p-3 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{event.shortName}</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatScore(competitor.scores[event.id] || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorCard;