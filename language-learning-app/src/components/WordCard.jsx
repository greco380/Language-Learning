import React from 'react';
import { Clock, Globe, Trash2, Volume2 } from 'lucide-react';

const WordCard = ({ word, language, context, timestamp, onDelete, wordId }) => {
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
      const utterance = new SpeechSynthesisUtterance(word);

      // Try to find a voice for the language
      const voices = speechSynthesis.getVoices();
      const languageCode = getLanguageCode(language);
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

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Word */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {word}
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
              {language}
            </span>
          </div>

          {/* Context */}
          {context && (
            <p className="text-sm text-gray-600 italic mb-2 line-clamp-2">
              "{context}"
            </p>
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
