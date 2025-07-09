import React, { useState } from 'react';
import { Competitor, Event } from '../types';
import { formatScore } from '../utils/scoring';
import { Save, X } from 'lucide-react';

interface ScoreEntryProps {
  competitor: Competitor;
  event: Event;
  onSave: (competitorId: string, eventId: string, score: number) => void;
  onCancel: () => void;
}

const ScoreEntry: React.FC<ScoreEntryProps> = ({ competitor, event, onSave, onCancel }) => {
  const [score, setScore] = useState(competitor.scores[event.id]?.toString() || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scoreValue = parseFloat(score);
    
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > event.maxScore) {
      setError(`Score must be between 0 and ${event.maxScore}`);
      return;
    }
    
    onSave(competitor.id, event.id, scoreValue);
  };

  const handleScoreChange = (value: string) => {
    setScore(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Score</h2>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">Competitor</p>
            <p className="font-semibold text-gray-900">{competitor.name}</p>
            <p className="text-sm text-gray-600 mt-2">Event</p>
            <p className="font-semibold text-gray-900">{event.name}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                Score (0.00 - {event.maxScore.toFixed(2)})
              </label>
              <input
                type="number"
                id="score"
                value={score}
                onChange={(e) => handleScoreChange(e.target.value)}
                step="0.01"
                min="0"
                max={event.maxScore}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="0.00"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Score</span>
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScoreEntry;