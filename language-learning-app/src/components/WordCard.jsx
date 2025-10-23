import React, { useState } from 'react';
import { Clock, Globe, Trash2, Volume2, ArrowRight, Edit2, Check, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const WordCard = ({ word, language, context, timestamp, onDelete, wordId, foreignWord, nativeWord }) => {
  const { updateWord } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editForeignWord, setEditForeignWord] = useState('');
  const [editNativeWord, setEditNativeWord] = useState('');
  const [editError, setEditError] = useState(null);
  // Support both old and new format
  const isNewFormat = foreignWord && nativeWord;
  const displayWord = isNewFormat ? foreignWord.text : word;
  const displayLanguage = isNewFormat ? foreignWord.language : language;
  const displayTranslation = isNewFormat ? nativeWord.text : null;
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(displayWord);

      // Try to find a voice for the language
      const voices = speechSynthesis.getVoices();
      const languageCode = getLanguageCode(displayLanguage);
      const voice = voices.find(v => v.lang.startsWith(languageCode));

      if (voice) {
        utterance.voice = voice;
      }

      utterance.lang = languageCode;
      speechSynthesis.speak(utterance);
    }
  };

  const getLanguageCode = (lang) => {
    const languageCodes = {
      Spanish: 'es',
      French: 'fr',
      German: 'de',
      Italian: 'it',
      Portuguese: 'pt',
      Japanese: 'ja',
      Chinese: 'zh',
      Korean: 'ko',
      Russian: 'ru',
      Arabic: 'ar',
      Hindi: 'hi',
      Dutch: 'nl',
      Swedish: 'sv',
      Norwegian: 'no',
      Danish: 'da',
    };
    return languageCodes[lang] || 'en';
  };

  const handleStartEdit = () => {
    if (isNewFormat) {
      setEditForeignWord(foreignWord.text);
      setEditNativeWord(nativeWord.text);
      setIsEditing(true);
      setEditError(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForeignWord('');
    setEditNativeWord('');
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editForeignWord.trim() || !editNativeWord.trim()) {
      setEditError('Both words are required');
      return;
    }

    try {
      const updates = {
        foreignWord: {
          ...foreignWord,
          text: editForeignWord.trim(),
        },
        nativeWord: {
          ...nativeWord,
          text: editNativeWord.trim(),
        },
      };

      await updateWord(wordId, updates);
      setIsEditing(false);
      setEditError(null);
    } catch (error) {
      setEditError('Failed to update word');
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Word or Word Pair */}
          {isNewFormat ? (
            <div>
              {isEditing ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-600">Foreign Word ({displayLanguage})</label>
                    <input
                      type="text"
                      value={editForeignWord}
                      onChange={(e) => setEditForeignWord(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Foreign word"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-600">English Translation</label>
                    <input
                      type="text"
                      value={editNativeWord}
                      onChange={(e) => setEditNativeWord(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="English translation"
                    />
                  </div>
                  {editError && (
                    <p className="text-xs text-red-600">{editError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div>
                  {/* Foreign Word and Translation */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
                        onClick={handleStartEdit}
                        title="Click to edit"
                      >
                        {displayWord}
                      </h3>
                      <button
                        onClick={handleSpeak}
                        className="p-1 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                        title="Pronounce word"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                    <h3
                      className="text-xl font-semibold text-green-700 cursor-pointer hover:text-green-800 transition-colors"
                      onClick={handleStartEdit}
                      title="Click to edit"
                    >
                      {displayTranslation}
                    </h3>
                    <button
                      onClick={handleStartEdit}
                      className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                      title="Edit word pair"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>

                  {/* Language */}
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {displayLanguage} → English
                    </span>
                    {nativeWord.inputMode && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {nativeWord.inputMode === 'text' ? 'Typed' : 'Recorded'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Old Format - Single Word */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {displayWord}
                </h3>
                <button
                  onClick={handleSpeak}
                  className="p-1 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                  title="Pronounce word"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  {displayLanguage}
                </span>
              </div>

              {/* Context */}
              {context && (
                <p className="text-sm text-gray-600 italic mb-2 line-clamp-2">
                  "{context}"
                </p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>{formatDate(timestamp)}</span>
          </div>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={() => onDelete(wordId)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete word"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default WordCard;
