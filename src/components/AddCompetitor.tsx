import React, { useState } from 'react';
import { Plus, User, Users, Award } from 'lucide-react';

interface AddCompetitorProps {
  onAdd: (name: string, team: string, level: string) => void;
}

const AddCompetitor: React.FC<AddCompetitorProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [level, setLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && team.trim() && level.trim()) {
      onAdd(name.trim(), team.trim(), level.trim());
      setName('');
      setTeam('');
      setLevel('');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setTeam('');
    setLevel('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600"
      >
        <Plus className="w-5 h-5" />
        <span>Add Competitor</span>
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Competitor</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Competitor Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter competitor name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Team/Club
          </label>
          <input
            type="text"
            id="team"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter team or club name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="w-4 h-4 inline mr-1" />
            Level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select level</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
            <option value="Level 5">Level 5</option>
            <option value="Level 6">Level 6</option>
            <option value="Level 7">Level 7</option>
            <option value="Level 8">Level 8</option>
            <option value="Level 9">Level 9</option>
            <option value="Level 10">Level 10</option>
            <option value="Elite">Elite</option>
          </select>
        </div>
        
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Add Competitor
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCompetitor;