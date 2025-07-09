import React, { useState } from 'react';
import { Competitor, Event } from '../types';
import { formatScore, getAvailableLevels, filterCompetitorsByLevel, calculateRankings } from '../utils/scoring';
import { Download, FileText, Database, FileSpreadsheet, Calendar, Trophy, Users, BarChart3 } from 'lucide-react';

interface ExportResultsProps {
  competitors: Competitor[];
  events: Event[];
  section: 'men' | 'women';
  selectedLevel?: string | null;
}

const ExportResults: React.FC<ExportResultsProps> = ({ 
  competitors, 
  events, 
  section,
  selectedLevel 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'txt'>('csv');

  const filteredCompetitors = filterCompetitorsByLevel(competitors, selectedLevel);
  const rankedCompetitors = calculateRankings(filteredCompetitors);

  const generateTimestamp = () => {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
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

  const exportToCSV = () => {
    const stats = getCompetitionStats();
    const timestamp = new Date().toLocaleString();
    
    // Create CSV content
    let csvContent = '';
    
    // Header information
    csvContent += `Gymnastics Competition Results\n`;
    csvContent += `Section,${section === 'women' ? "Women's" : "Men's"} Division\n`;
    csvContent += `Export Date,${timestamp}\n`;
    if (selectedLevel) {
      csvContent += `Level Filter,${selectedLevel}\n`;
    }
    csvContent += `Total Competitors,${stats.totalCompetitors}\n`;
    csvContent += `Completion Rate,${stats.completionRate.toFixed(1)}%\n`;
    csvContent += `\n`;
    
    // Results table header
    csvContent += `Rank,Name,Team,Level,`;
    events.forEach(event => {
      csvContent += `${event.shortName},`;
    });
    csvContent += `Total Score\n`;
    
    // Results data
    rankedCompetitors.forEach(competitor => {
      csvContent += `${competitor.rank},`;
      csvContent += `"${competitor.name}",`;
      csvContent += `"${competitor.team}",`;
      csvContent += `${competitor.level},`;
      events.forEach(event => {
        csvContent += `${formatScore(competitor.scores[event.id] || 0)},`;
      });
      csvContent += `${formatScore(competitor.totalScore)}\n`;
    });

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gymnastics-results-${section}-${generateTimestamp()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const stats = getCompetitionStats();
    const exportData = {
      metadata: {
        title: 'Gymnastics Competition Results',
        section: section === 'women' ? "Women's Division" : "Men's Division",
        exportDate: new Date().toISOString(),
        levelFilter: selectedLevel || 'All Levels',
        statistics: stats
      },
      events: events.map(event => ({
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        maxScore: event.maxScore
      })),
      results: rankedCompetitors.map(competitor => ({
        rank: competitor.rank,
        id: competitor.id,
        name: competitor.name,
        team: competitor.team,
        level: competitor.level,
        scores: competitor.scores,
        totalScore: competitor.totalScore
      }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gymnastics-results-${section}-${generateTimestamp()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToText = () => {
    const stats = getCompetitionStats();
    const timestamp = new Date().toLocaleString();
    
    let textContent = '';
    
    // Header
    textContent += '='.repeat(60) + '\n';
    textContent += '           GYMNASTICS COMPETITION RESULTS\n';
    textContent += '='.repeat(60) + '\n\n';
    
    textContent += `Section: ${section === 'women' ? "Women's" : "Men's"} Division\n`;
    textContent += `Export Date: ${timestamp}\n`;
    if (selectedLevel) {
      textContent += `Level Filter: ${selectedLevel}\n`;
    }
    textContent += `Total Competitors: ${stats.totalCompetitors}\n`;
    textContent += `Completion Rate: ${stats.completionRate.toFixed(1)}%\n\n`;
    
    // Events
    textContent += 'EVENTS:\n';
    textContent += '-'.repeat(30) + '\n';
    events.forEach(event => {
      textContent += `${event.shortName}: ${event.name} (Max: ${event.maxScore})\n`;
    });
    textContent += '\n';
    
    // Results by level if not filtered
    if (!selectedLevel) {
      const levels = getAvailableLevels(competitors);
      levels.forEach(level => {
        const levelCompetitors = calculateRankings(competitors.filter(c => c.level === level));
        if (levelCompetitors.length > 0) {
          textContent += `${level.toUpperCase()} RESULTS:\n`;
          textContent += '-'.repeat(40) + '\n';
          
          levelCompetitors.forEach(competitor => {
            textContent += `${competitor.rank}. ${competitor.name} (${competitor.team})\n`;
            textContent += `   `;
            events.forEach(event => {
              textContent += `${event.shortName}: ${formatScore(competitor.scores[event.id] || 0)}  `;
            });
            textContent += `Total: ${formatScore(competitor.totalScore)}\n\n`;
          });
        }
      });
    } else {
      // Single level results
      textContent += `${selectedLevel.toUpperCase()} RESULTS:\n`;
      textContent += '-'.repeat(40) + '\n';
      
      rankedCompetitors.forEach(competitor => {
        textContent += `${competitor.rank}. ${competitor.name} (${competitor.team})\n`;
        textContent += `   `;
        events.forEach(event => {
          textContent += `${event.shortName}: ${formatScore(competitor.scores[event.id] || 0)}  `;
        });
        textContent += `Total: ${formatScore(competitor.totalScore)}\n\n`;
      });
    }
    
    textContent += '='.repeat(60) + '\n';
    textContent += 'Generated by Gymnastics Competition Score Keeper\n';
    textContent += '='.repeat(60) + '\n';

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gymnastics-results-${section}-${generateTimestamp()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'txt':
        exportToText();
        break;
    }
    setIsOpen(false);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'json':
        return <Database className="w-4 h-4" />;
      case 'txt':
        return <FileText className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'csv':
        return 'Spreadsheet format - Perfect for Excel, Google Sheets, or data analysis';
      case 'json':
        return 'Structured data format - Ideal for developers or data processing';
      case 'txt':
        return 'Formatted text report - Great for printing or sharing readable results';
      default:
        return '';
    }
  };

  if (competitors.length === 0) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
      >
        <Download className="w-4 h-4" />
        <span>Export Results</span>
      </button>
    );
  }

  const stats = getCompetitionStats();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Competition Results</h2>
          <p className="text-gray-600 mb-6">Download your competition data in your preferred format</p>
          
          {/* Export Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Export Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Section: {section === 'women' ? "Women's" : "Men's"} Division</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span>Competitors: {stats.totalCompetitors}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Completion: {stats.completionRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            {selectedLevel && (
              <div className="mt-2 text-sm text-blue-700">
                <strong>Level Filter:</strong> {selectedLevel}
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Choose Export Format</h3>
            <div className="space-y-3">
              {(['csv', 'json', 'txt'] as const).map(format => (
                <label
                  key={format}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    exportFormat === format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format}
                    checked={exportFormat === format}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getFormatIcon(format)}
                      <span className="font-medium text-gray-900 uppercase">{format}</span>
                    </div>
                    <p className="text-sm text-gray-600">{getFormatDescription(format)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export {exportFormat.toUpperCase()}</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportResults;