import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import { Competitor } from '../types';
import { generateId } from '../utils/scoring';

interface ImportCompetitorsProps {
  onImport: (competitors: Omit<Competitor, 'id' | 'scores' | 'totalScore' | 'rank'>[]) => void;
  selectedSection: 'men' | 'women';
}

interface ParsedCompetitor {
  name: string;
  team: string;
  level: string;
  isValid: boolean;
  errors: string[];
}

const ImportCompetitors: React.FC<ImportCompetitorsProps> = ({ onImport, selectedSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCompetitor[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateLevel = (level: string): boolean => {
    const validLevels = [
      'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5',
      'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10', 'Elite'
    ];
    return validLevels.includes(level);
  };

  const parseCSV = (csvText: string): ParsedCompetitor[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Skip header row if it exists
    const dataLines = lines[0].toLowerCase().includes('name') ? lines.slice(1) : lines;
    
    return dataLines.map((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      const errors: string[] = [];
      
      const name = columns[0] || '';
      const team = columns[1] || '';
      const level = columns[2] || '';

      if (!name) errors.push('Name is required');
      if (!team) errors.push('Team is required');
      if (!level) errors.push('Level is required');
      if (level && !validateLevel(level)) {
        errors.push(`Invalid level: ${level}. Must be Level 1-10 or Elite`);
      }

      return {
        name,
        team,
        level,
        isValid: errors.length === 0,
        errors
      };
    }).filter(competitor => competitor.name || competitor.team || competitor.level);
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsed = parseCSV(csvText);
      setParsedData(parsed);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    const validCompetitors = parsedData.filter(comp => comp.isValid);
    if (validCompetitors.length === 0) return;

    setImporting(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onImport(validCompetitors.map(comp => ({
      name: comp.name,
      team: comp.team,
      level: comp.level
    })));

    setImporting(false);
    setIsOpen(false);
    setShowPreview(false);
    setParsedData([]);
  };

  const downloadTemplate = () => {
    const csvContent = 'Name,Team,Level\n"John Doe","Gymnastics Club","Level 5"\n"Jane Smith","Elite Academy","Level 7"';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'competitors-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImport = () => {
    setShowPreview(false);
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedData.filter(comp => comp.isValid).length;
  const invalidCount = parsedData.length - validCount;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
      >
        <Upload className="w-4 h-4" />
        <span>Import CSV</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Competitors</h2>
              <p className="text-gray-600">Upload a CSV file to bulk import competitors for {selectedSection === 'women' ? "Women's" : "Men's"} division</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                resetImport();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showPreview ? (
            <>
              {/* CSV Format Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">CSV Format Requirements</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Columns:</strong> Name, Team, Level</p>
                  <p><strong>Valid Levels:</strong> Level 1, Level 2, Level 3, Level 4, Level 5, Level 6, Level 7, Level 8, Level 9, Level 10, Elite</p>
                  <p><strong>Example:</strong> "John Doe","Gymnastics Club","Level 5"</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop your CSV file here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse and select a file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Select CSV File
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Import Preview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Import Preview</h3>
                  <button
                    onClick={resetImport}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Choose Different File
                  </button>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{validCount}</div>
                    <div className="text-sm text-gray-600">Valid Competitors</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{invalidCount}</div>
                    <div className="text-sm text-gray-600">Invalid Rows</div>
                  </div>
                </div>

                {/* Data Preview Table */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Status</th>
                        <th className="text-left py-2 px-3">Name</th>
                        <th className="text-left py-2 px-3">Team</th>
                        <th className="text-left py-2 px-3">Level</th>
                        <th className="text-left py-2 px-3">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((competitor, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            {competitor.isValid ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium">{competitor.name || '-'}</td>
                          <td className="py-2 px-3">{competitor.team || '-'}</td>
                          <td className="py-2 px-3">{competitor.level || '-'}</td>
                          <td className="py-2 px-3">
                            {competitor.errors.length > 0 && (
                              <div className="text-red-600 text-xs">
                                {competitor.errors.join(', ')}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleImport}
                  disabled={validCount === 0 || importing}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Import {validCount} Competitor{validCount !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    resetImport();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportCompetitors;