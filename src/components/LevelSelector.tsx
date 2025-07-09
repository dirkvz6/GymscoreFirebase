import React from 'react';
import { Award, Filter } from 'lucide-react';

interface LevelSelectorProps {
  availableLevels: string[];
  selectedLevel: string | null;
  onLevelSelect: (level: string | null) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  availableLevels, 
  selectedLevel, 
  onLevelSelect 
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter by Level</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onLevelSelect(null)}
          className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
            selectedLevel === null
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>All Levels</span>
        </button>
        
        {availableLevels.map(level => (
          <button
            key={level}
            onClick={() => onLevelSelect(level)}
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 flex items-center space-x-2 ${
              selectedLevel === level
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{level}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelector;