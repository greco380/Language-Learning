import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import RecordButton from '../components/RecordButton';
import LanguageToggle from '../components/LanguageToggle';
import WordCard from '../components/WordCard';
import { useAppContext } from '../context/AppContext';

const HomePage = () => {
  const { words, selectedLanguage } = useAppContext();
  const navigate = useNavigate();

  const recentWords = words.slice(0, 3);

  const handleRecordComplete = (word) => {
    console.log('Word recorded:', word);
  };

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Language Learning
            </h1>
            <p className="text-gray-600">
              Record words and build your vocabulary
            </p>
          </div>
          <LanguageToggle />
        </div>

        {/* Main Recording Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="text-primary-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">
                Start Recording
              </h2>
            </div>
            <p className="text-gray-600 max-w-md mx-auto">
              Click the microphone and say:
              <br />
              <span className="font-medium text-primary-600">
                "Please say [word] in {selectedLanguage}"
              </span>
            </p>
          </div>

          {/* Record Button */}
          <div className="flex justify-center">
            <RecordButton onRecordComplete={handleRecordComplete} />
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click the microphone button</li>
              <li>Say what word you want to learn (e.g., "Please say hello in Spanish")</li>
              <li>The word will be saved to your vocabulary</li>
              <li>Practice your words in the Practice section</li>
            </ol>
          </div>
        </div>

        {/* Stats */}
        {words.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Words</p>
                  <p className="text-3xl font-bold text-gray-900">{words.length}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <TrendingUp className="text-primary-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Learning</p>
                  <p className="text-3xl font-bold text-gray-900">{selectedLanguage}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Sparkles className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Words */}
        {recentWords.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Words</h2>
              <button
                onClick={() => navigate('/history')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {recentWords.map((word) => (
                <WordCard
                  key={word.id}
                  wordId={word.id}
                  word={word.word}
                  language={word.language}
                  context={word.context}
                  timestamp={word.timestamp}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/practice')}
            className="btn-primary py-4"
          >
            Practice Now
          </button>
          <button
            onClick={() => navigate('/curriculum')}
            className="btn-secondary py-4"
          >
            View Curriculum
          </button>
        </div>

        {/* Empty State */}
        {words.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Start Your Learning Journey
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Record your first word by clicking the microphone above.
              Build your vocabulary and practice anytime!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
