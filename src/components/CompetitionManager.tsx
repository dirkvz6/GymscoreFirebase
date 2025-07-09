import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Trophy, Edit3, Trash2, Play } from 'lucide-react';
import { Competition } from '../types';
import { competitionService } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';

interface CompetitionManagerProps {
  onSelectCompetition: (competition: Competition) => void;
  selectedCompetition: Competition | null;
}

const CompetitionManager: React.FC<CompetitionManagerProps> = ({ 
  onSelectCompetition, 
  selectedCompetition 
}) => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    section: 'women' as 'men' | 'women'
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCompetitions();
    }
  }, [user]);

  const loadCompetitions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userCompetitions = await competitionService.getUserCompetitions(user.uid);
      setCompetitions(userCompetitions);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const competitionId = await competitionService.createCompetition({
        name: formData.name,
        date: formData.date,
        section: formData.section,
        events: [],
        competitors: []
      }, user.uid);

      const newCompetition: Competition = {
        id: competitionId,
        name: formData.name,
        date: formData.date,
        section: formData.section,
        events: [],
        competitors: []
      };

      setCompetitions(prev => [newCompetition, ...prev]);
      setFormData({ name: '', date: new Date().toISOString().split('T')[0], section: 'women' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating competition:', error);
    }
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    if (!confirm('Are you sure you want to delete this competition? This action cannot be undone.')) {
      return;
    }

    try {
      await competitionService.deleteCompetition(competitionId);
      setCompetitions(prev => prev.filter(comp => comp.id !== competitionId));
      if (selectedCompetition?.id === competitionId) {
        onSelectCompetition(null as any);
      }
    } catch (error) {
      console.error('Error deleting competition:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Competitions</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Competition</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Competition</h3>
          <form onSubmit={handleCreateCompetition} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spring Championship 2024"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                id="section"
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value as 'men' | 'women' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="women">Women's Gymnastics</option>
                <option value="men">Men's Gymnastics</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Create Competition
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {competitions.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No competitions yet</h3>
          <p className="text-gray-600">Create your first competition to start tracking scores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className={`p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                selectedCompetition?.id === competition.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{competition.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(competition.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{competition.section === 'women' ? "Women's" : "Men's"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompetition(competition.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Delete competition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => onSelectCompetition(competition)}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Open Competition</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitionManager;