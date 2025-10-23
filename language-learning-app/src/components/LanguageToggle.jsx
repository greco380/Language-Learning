import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LanguageToggle = () => {
  const { selectedLanguage, changeLanguage } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Chinese',
    'Korean',
    'Russian',
    'Arabic',
    'Hindi',
    'Dutch',
    'Swedish',
    'Norwegian',
    'Danish',
  ];

  const handleLanguageChange = (language) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
      >
        <Globe size={20} className="text-primary-600" />
        <span className="font-medium text-gray-700">{selectedLanguage}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                Select Target Language
              </div>
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-primary-50 transition-colors duration-150 ${
                    selectedLanguage === language
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;
