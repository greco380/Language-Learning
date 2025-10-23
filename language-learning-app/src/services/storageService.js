// LocalStorage service for persisting app data

const STORAGE_KEYS = {
  WORDS: 'language_learning_words',
  CURRICULUM: 'language_learning_curriculum',
  PROGRESS: 'language_learning_progress',
  SELECTED_LANGUAGE: 'language_learning_selected_language',
  USER_PREFERENCES: 'language_learning_preferences',
};

class StorageService {
  // Word management
  saveWord(wordObj) {
    try {
      const words = this.getWords();
      const newWord = {
        id: Date.now().toString(),
        ...wordObj,
        timestamp: wordObj.timestamp || new Date().toISOString(),
      };
      words.unshift(newWord); // Add to beginning
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
      return newWord;
    } catch (error) {
      console.error('Error saving word:', error);
      throw new Error('Failed to save word');
    }
  }

  getWords() {
    try {
      const words = localStorage.getItem(STORAGE_KEYS.WORDS);
      return words ? JSON.parse(words) : [];
    } catch (error) {
      console.error('Error getting words:', error);
      return [];
    }
  }

  deleteWord(wordId) {
    try {
      const words = this.getWords();
      const filteredWords = words.filter(word => word.id !== wordId);
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(filteredWords));
      return true;
    } catch (error) {
      console.error('Error deleting word:', error);
      return false;
    }
  }

  // Curriculum management
  saveCurriculum(curriculum) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(curriculum));
      return true;
    } catch (error) {
      console.error('Error saving curriculum:', error);
      return false;
    }
  }

  getCurriculum() {
    try {
      const curriculum = localStorage.getItem(STORAGE_KEYS.CURRICULUM);
      return curriculum ? JSON.parse(curriculum) : null;
    } catch (error) {
      console.error('Error getting curriculum:', error);
      return null;
    }
  }

  // Progress management
  saveProgress(courseId, progressData) {
    try {
      const allProgress = this.getProgress();
      allProgress[courseId] = {
        ...progressData,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  }

  getProgress(courseId = null) {
    try {
      const progress = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const allProgress = progress ? JSON.parse(progress) : {};
      return courseId ? allProgress[courseId] : allProgress;
    } catch (error) {
      console.error('Error getting progress:', error);
      return courseId ? null : {};
    }
  }

  // Language preference
  saveSelectedLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language);
      return true;
    } catch (error) {
      console.error('Error saving language:', error);
      return false;
    }
  }

  getSelectedLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_LANGUAGE) || 'Spanish';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'Spanish';
    }
  }

  // User preferences
  savePreferences(preferences) {
    try {
      const currentPrefs = this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  getPreferences() {
    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return prefs ? JSON.parse(prefs) : {
        nativeLanguage: 'English',
        autoDetectLanguage: true,
        showTranslations: true,
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {};
    }
  }

  // Clear all data
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Export/Import for backup
  exportData() {
    try {
      const data = {
        words: this.getWords(),
        curriculum: this.getCurriculum(),
        progress: this.getProgress(),
        language: this.getSelectedLanguage(),
        preferences: this.getPreferences(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.words) localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(data.words));
      if (data.curriculum) localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(data.curriculum));
      if (data.progress) localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
      if (data.language) localStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, data.language);
      if (data.preferences) localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(data.preferences));
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default new StorageService();
