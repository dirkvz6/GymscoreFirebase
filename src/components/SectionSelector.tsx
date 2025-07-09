import React from 'react';
import { Users, User } from 'lucide-react';

interface SectionSelectorProps {
  selectedSection: 'men' | 'women';
  onSectionChange: (section: 'men' | 'women') => void;
}

const SectionSelector: React.FC<SectionSelectorProps> = ({ selectedSection, onSectionChange }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Competition Section</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSectionChange('women')}
          className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
            selectedSection === 'women'
              ? 'border-pink-500 bg-pink-50 text-pink-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Users className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Women's Gymnastics</div>
            <div className="text-sm opacity-75">4 Events: VT, UB, BB, FX</div>
          </div>
        </button>
        
        <button
          onClick={() => onSectionChange('men')}
          className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
            selectedSection === 'men'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <User className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Men's Gymnastics</div>
            <div className="text-sm opacity-75">6 Events: FX, PH, SR, VT, PB, HB</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SectionSelector;