import React, { useState, useEffect } from 'react';
import { Competitor, Event, Competition } from './types';
import { WOMEN_EVENTS, MEN_EVENTS } from './data/events';
import { calculateRankings, getAvailableLevels, filterCompetitorsByLevel, generateId } from './utils/scoring';
import { competitorService } from './services/firebaseService';
import { useAuth } from './hooks/useAuth';
import CompetitorCard from './components/CompetitorCard';
import CompetitorTable from './components/CompetitorTable';
import AddCompetitor from './components/AddCompetitor';
import ImportCompetitors from './components/ImportCompetitors';
import ScoreEntry from './components/ScoreEntry';
import EventSelector from './components/EventSelector';
import SectionSelector from './components/SectionSelector';
import LevelSelector from './components/LevelSelector';
import LevelGroupedResults from './components/LevelGroupedResults';
import ExportResults from './components/ExportResults';
import AuthModal from './components/AuthModal';
import CompetitionManager from './components/CompetitionManager';
import { Medal, Trophy, Users, BarChart3, TableIcon, Grid3X3, Layers, Crown, LogOut, User } from 'lucide-react';

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [selectedSection, setSelectedSection] = useState<'men' | 'women'>('women');
  const [events, setEvents] = useState<Event[]>(WOMEN_EVENTS);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<{ competitor: Competitor; event: Event } | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [groupByLevel, setGroupByLevel] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  // Update events when section changes
  useEffect(() => {
    setEvents(selectedSection === 'women' ? WOMEN_EVENTS : MEN_EVENTS);
    setSelectedEvent(null);
    setSelectedLevel(null);
  }, [selectedSection]);

  // Load competitors when competition is selected
  useEffect(() => {
    if (selectedCompetition) {
      loadCompetitors();
      setSelectedSection(selectedCompetition.section);
    } else {
      setCompetitors([]);
    }
  }, [selectedCompetition]);

  const loadCompetitors = async () => {
    if (!selectedCompetition) return;
    
    try {
      setLoading(true);
      const competitionCompetitors = await competitorService.getCompetitionCompetitors(selectedCompetition.id);
      setCompetitors(competitionCompetitors);
    } catch (error) {
      console.error('Error loading competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = async (name: string, team: string, level: string) => {
    if (!selectedCompetition) return;
    
    const newCompetitor: Competitor = {
      id: generateId(),
      name,
      team,
      level,
      scores: {},
      totalScore: 0,
      rank: 0,
    };
    
    try {
      const competitorId = await competitorService.addCompetitor(newCompetitor, selectedCompetition.id);
      setCompetitors(prev => [...prev, { ...newCompetitor, id: competitorId }]);
    } catch (error) {
      console.error('Error adding competitor:', error);
    }
  };

  const importCompetitors = async (competitorData: Omit<Competitor, 'id' | 'scores' | 'totalScore' | 'rank'>[]) => {
    if (!selectedCompetition) return;
    
    const newCompetitors: Competitor[] = competitorData.map(data => ({
      id: generateId(),
      name: data.name,
      team: data.team,
      level: data.level,
      scores: {},
      totalScore: 0,
      rank: 0,
    }));
    
    try {
      const addedCompetitors = await Promise.all(
        newCompetitors.map(async (competitor) => {
          const competitorId = await competitorService.addCompetitor(competitor, selectedCompetition.id);
          return { ...competitor, id: competitorId };
        })
      );
      setCompetitors(prev => [...prev, ...addedCompetitors]);
    } catch (error) {
      console.error('Error importing competitors:', error);
    }
  };

  const updateScore = async (competitorId: string, eventId: string, score: number) => {
    setCompetitors(prev =>
      prev.map(competitor =>
        competitor.id === competitorId
          ? {
              ...competitor,
              scores: { ...competitor.scores, [eventId]: score },
            }
          : competitor
      )
    );
    
    try {
      await competitorService.updateScore(competitorId, eventId, score);
    } catch (error) {
      console.error('Error updating score:', error);
    }
    setEditingScore(null);
  };

  const currentCompetitors = competitors;
  const filteredCompetitors = filterCompetitorsByLevel(currentCompetitors, selectedLevel);
  const rankedCompetitors = calculateRankings(filteredCompetitors);
  const availableLevels = getAvailableLevels(currentCompetitors);

  const getTopPerformersByLevel = () => {
    const competitorsByLevel = currentCompetitors.reduce((groups, competitor) => {
      const level = competitor.level;
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(competitor);
      return groups;
    }, {} as Record<string, Competitor[]>);

    // Sort levels in logical order
    const sortedLevels = Object.keys(competitorsByLevel).sort((a, b) => {
      if (a === 'Elite') return 1;
      if (b === 'Elite') return -1;
      
      const aNum = parseInt(a.replace('Level ', ''));
      const bNum = parseInt(b.replace('Level ', ''));
      
      return aNum - bNum;
    });

    return sortedLevels.map(level => ({
      level,
      competitors: calculateRankings(competitorsByLevel[level]).slice(0, 3)
    })).filter(group => group.competitors.length > 0);
  };

  const getLevelIcon = (level: string) => {
    if (level === 'Elite') return <Crown className="w-5 h-5 text-yellow-500" />;
    const levelNum = parseInt(level.replace('Level ', ''));
    if (levelNum >= 8) return <Trophy className="w-5 h-5 text-purple-500" />;
    if (levelNum >= 5) return <Medal className="w-5 h-5 text-blue-500" />;
    return <Medal className="w-5 h-5 text-green-500" />;
  };

  const getLevelColor = (level: string) => {
    if (level === 'Elite') return 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50';
    const levelNum = parseInt(level.replace('Level ', ''));
    if (levelNum >= 8) return 'border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50';
    if (levelNum >= 5) return 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50';
    return 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50';
  };

  const getCompetitionStats = () => {
    const totalCompetitors = filteredCompetitors.length;
    const completedRoutines = filteredCompetitors.reduce((total, competitor) => {
      return total + Object.keys(competitor.scores).length;
    }, 0);
    const totalRoutines = totalCompetitors * events.length;
    const completionRate = totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0;
    
    return {
      totalCompetitors,
      completedRoutines,
      totalRoutines,
      completionRate
    };
  };

  const stats = getCompetitionStats();
  const topPerformersByLevel = getTopPerformersByLevel();

  // Show auth modal if user is not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gymnastics Competition Score Keeper
            </h1>
            <p className="text-gray-600 mb-6">Professional scoring system for gymnastics competitions</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gymnastics Competition Score Keeper
            </h1>
            <p className="text-gray-600">Professional scoring system for gymnastics competitions</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Competition Manager */}
        <CompetitionManager
          onSelectCompetition={setSelectedCompetition}
          selectedCompetition={selectedCompetition}
        />

        {!selectedCompetition ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a competition to get started</h3>
            <p className="text-gray-600">Choose an existing competition or create a new one to start tracking scores</p>
          </div>
        ) : (
          <>
            {/* Competition Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCompetition.name}</h2>
                  <div className="flex items-center space-x-4 text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedCompetition.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{selectedCompetition.section === 'women' ? "Women's" : "Men's"} Division</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompetition(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Back to Competitions
                </button>
              </div>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Competitors</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCompetitors}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Routines</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedRoutines}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completionRate.toFixed(0)}%</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Levels</p>
                <p className="text-3xl font-bold text-orange-600">{availableLevels.length}</p>
              </div>
              <Medal className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Current Leaders by Level */}
        {topPerformersByLevel.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Current Leaders - {selectedSection === 'women' ? "Women's" : "Men's"} Division
            </h2>
            <div className="space-y-6">
              {topPerformersByLevel.map(({ level, competitors }) => (
                <div key={level} className={`border-2 rounded-2xl p-6 ${getLevelColor(level)}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    {getLevelIcon(level)}
                    <h3 className="text-xl font-bold text-gray-900">{level}</h3>
                    <span className="text-sm text-gray-600">
                      Top {competitors.length} of {currentCompetitors.filter(c => c.level === level).length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {competitors.map((competitor) => (
                      <CompetitorCard
                        key={competitor.id}
                        competitor={competitor}
                        events={events}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Competitor */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Add Competitors - {selectedCompetition.section === 'women' ? "Women's" : "Men's"} Division
            </h2>
            <ImportCompetitors
              onImport={importCompetitors}
              selectedSection={selectedCompetition.section}
            />
          </div>
          <AddCompetitor onAdd={addCompetitor} />
        </div>

        {/* Level Filter */}
        {currentCompetitors.length > 0 && availableLevels.length > 1 && (
          <div className="mb-8">
            <LevelSelector
              availableLevels={availableLevels}
              selectedLevel={selectedLevel}
              onLevelSelect={setSelectedLevel}
            />
          </div>
        )}

        {/* Event Selection */}
        {currentCompetitors.length > 0 && (
          <div className="mb-8">
            <EventSelector
              events={events}
              selectedEvent={selectedEvent}
              onEventSelect={setSelectedEvent}
            />
          </div>
        )}

        {/* Competition Results */}
        {currentCompetitors.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Competition Results - {selectedSection === 'women' ? "Women's" : "Men's"} Division
                {selectedLevel && ` (${selectedLevel})`}
              </h2>
              <div className="flex items-center space-x-2">
                <ExportResults
                  competitors={filteredCompetitors}
                  events={events}
                  section={selectedCompetition.section}
                  selectedLevel={selectedLevel}
                />
                <button
                  onClick={() => setGroupByLevel(!groupByLevel)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    groupByLevel 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={groupByLevel ? 'Ungroup levels' : 'Group by level'}
                >
                  <Layers className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TableIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {groupByLevel && !selectedLevel ? (
              <LevelGroupedResults
                competitors={currentCompetitors}
                events={events}
                viewMode={viewMode}
                onEditScore={(competitor, event) => setEditingScore({ competitor, event })}
              />
            ) : (
              <>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {rankedCompetitors.map((competitor) => (
                      <CompetitorCard
                        key={competitor.id}
                        competitor={competitor}
                        events={events}
                      />
                    ))}
                  </div>
                ) : (
                  <CompetitorTable
                    competitors={rankedCompetitors}
                    events={events}
                    onEditScore={(competitor, event) => setEditingScore({ competitor, event })}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {currentCompetitors.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No competitors in {selectedCompetition.section === 'women' ? "women's" : "men's"} division yet
            </h3>
            <p className="text-gray-600">Add your first competitor or import from CSV to start tracking scores</p>
          </div>
        )}
          </>
        )}

        {/* Empty State for Filtered Results */}
        {currentCompetitors.length > 0 && filteredCompetitors.length === 0 && selectedLevel && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No competitors found for {selectedLevel}
            </h3>
            <p className="text-gray-600">Try selecting a different level or add competitors to this level</p>
          </div>
        )}

        {/* Score Entry Modal */}
        {editingScore && (
          <ScoreEntry
            competitor={editingScore.competitor}
            event={editingScore.event}
            onSave={updateScore}
            onCancel={() => setEditingScore(null)}
          />
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default App;