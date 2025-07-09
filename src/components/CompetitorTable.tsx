import React from 'react';
import { Competitor, Event } from '../types';
import { formatScore } from '../utils/scoring';
import { Edit3, Medal, Trophy } from 'lucide-react';

interface CompetitorTableProps {
  competitors: Competitor[];
  events: Event[];
  onEditScore: (competitor: Competitor, event: Event) => void;
}

const CompetitorTable: React.FC<CompetitorTableProps> = ({ competitors, events, onEditScore }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="text-sm text-gray-500">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competitor
              </th>
              {events.map(event => (
                <th key={event.id} className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {event.shortName}
                </th>
              ))}
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {competitors.map((competitor) => (
              <tr key={competitor.id} className={`hover:bg-gray-50 ${getRankStyle(competitor.rank)}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getRankIcon(competitor.rank)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{competitor.name}</div>
                    <div className="text-sm text-gray-500">{competitor.team} • {competitor.level}</div>
                  </div>
                </td>
                {events.map(event => (
                  <td key={event.id} className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onEditScore(competitor, event)}
                      className="group relative inline-flex items-center space-x-1 text-sm font-medium hover:text-blue-600 transition-colors duration-200"
                    >
                      <span>{formatScore(competitor.scores[event.id] || 0)}</span>
                      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-lg font-bold text-blue-600">
                    {formatScore(competitor.totalScore)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitorTable;