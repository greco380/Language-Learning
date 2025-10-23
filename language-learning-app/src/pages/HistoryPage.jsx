import React, { useState } from 'react';
import { Search, Filter, Download, AlertCircle } from 'lucide-react';
import WordCard from '../components/WordCard';
import { useAppContext } from '../context/AppContext';

const HistoryPage = () => {
  const { words, deleteWord, exportData } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Get unique languages from words
  const languages = ['all', ...new Set(words.map((w) => w.language))];

  // Filter and sort words
  const filteredWords = words
    .filter((word) => {
      const matchesSearch = word.word
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLanguage =
        filterLanguage === 'all' || word.language === filterLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'oldest') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      } else if (sortBy === 'alphabetical') {
        return a.word.localeCompare(b.word);
      }
      return 0;
    });

  const handleDeleteWord = (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      deleteWord(wordId);
    }
  };

  const handleExport = () => {
    exportData();
  };

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Word History
          </h1>
          <p className="text-gray-600">
            View and manage all your recorded words
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">
                {words.length}
              </p>
              <p className="text-sm text-gray-600">Total Words</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {languages.length - 1}
              </p>
              <p className="text-sm text-gray-600">Languages</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {filteredWords.length}
              </p>
              <p className="text-sm text-gray-600">Filtered</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        {words.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3">
              {/* Language Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  <Filter size={12} className="inline mr-1" />
                  Language
                </label>
                <select
                  value={filterLanguage}
                  onChange={(e) => setFilterLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === 'all' ? 'All Languages' : lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="w-full mt-4 btn-secondary flex items-center justify-center gap-2"
            >
              <Download size={18} />
              <span>Export Data</span>
            </button>
          </div>
        )}

        {/* Word List */}
        {filteredWords.length > 0 ? (
          <div className="space-y-3">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                wordId={word.id}
                word={word.word}
                language={word.language}
                context={word.context}
                timestamp={word.timestamp}
                onDelete={handleDeleteWord}
              />
            ))}
          </div>
        ) : words.length > 0 ? (
          // No results from filter
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No words found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Words Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start recording words to build your vocabulary
            </p>
            <a
              href="/"
              className="inline-block btn-primary"
            >
              Record Your First Word
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
