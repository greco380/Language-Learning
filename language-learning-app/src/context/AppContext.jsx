import React, { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';
import openaiService from '../services/openaiService';
import { createCourses, groupWordsByTheme } from '../utils/curriculumGenerator';
import { determineUserLevel } from '../utils/scoreCalculator';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [words, setWords] = useState([]);
  const [curriculum, setCurriculum] = useState(null);
  const [progress, setProgress] = useState({});
  const [userLevel, setUserLevel] = useState('beginner');
  const [activeCourse, setActiveCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data from localStorage
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Update user level when progress changes
  useEffect(() => {
    const level = determineUserLevel(progress);
    setUserLevel(level);
  }, [progress]);

  /**
   * Load data from localStorage
   */
  const loadFromStorage = () => {
    try {
      const storedLanguage = storageService.getSelectedLanguage();
      const storedWords = storageService.getWords();
      const storedCurriculum = storageService.getCurriculum();
      const storedProgress = storageService.getProgress();

      setSelectedLanguage(storedLanguage);
      setWords(storedWords);
      setCurriculum(storedCurriculum);
      setProgress(storedProgress);
    } catch (error) {
      console.error('Error loading from storage:', error);
      setError('Failed to load saved data');
    }
  };

  /**
   * Add a new word to the collection
   */
  const addWord = async (wordData) => {
    try {
      const wordObj = {
        word: wordData.word,
        language: wordData.language || selectedLanguage,
        context: wordData.context || '',
        timestamp: new Date().toISOString(),
        audioUrl: wordData.audioUrl || null,
      };

      const savedWord = storageService.saveWord(wordObj);
      setWords(prev => [savedWord, ...prev]);

      // Invalidate curriculum to trigger regeneration
      setCurriculum(null);

      return savedWord;
    } catch (error) {
      console.error('Error adding word:', error);
      setError('Failed to save word');
      throw error;
    }
  };

  /**
   * Delete a word
   */
  const deleteWord = (wordId) => {
    try {
      const success = storageService.deleteWord(wordId);
      if (success) {
        setWords(prev => prev.filter(w => w.id !== wordId));
        // Invalidate curriculum
        setCurriculum(null);
      }
      return success;
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word');
      return false;
    }
  };

  /**
   * Change selected language
   */
  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    storageService.saveSelectedLanguage(language);
  };

  /**
   * Generate curriculum from recorded words
   */
  const generateCurriculum = async (forceRegenerate = false) => {
    if (curriculum && !forceRegenerate) {
      return curriculum;
    }

    if (words.length === 0) {
      const defaultCurriculum = openaiService.getDefaultCurriculum();
      setCurriculum(defaultCurriculum);
      storageService.saveCurriculum(defaultCurriculum);
      return defaultCurriculum;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try AI-powered curriculum generation
      const aiCurriculum = await openaiService.generateCurriculum(words);
      setCurriculum(aiCurriculum);
      storageService.saveCurriculum(aiCurriculum);
      setIsLoading(false);
      return aiCurriculum;
    } catch (error) {
      console.error('AI curriculum generation failed, using fallback:', error);

      // Fallback: use local curriculum generator
      const groupedWords = groupWordsByTheme(words);
      const localCurriculum = createCourses(groupedWords);
      setCurriculum(localCurriculum);
      storageService.saveCurriculum(localCurriculum);
      setIsLoading(false);
      return localCurriculum;
    }
  };

  /**
   * Select a course to practice
   */
  const selectCourse = (course) => {
    setActiveCourse(course);
  };

  /**
   * Update course progress
   */
  const updateProgress = (courseId, progressData) => {
    try {
      const updatedProgress = {
        ...progress,
        [courseId]: {
          ...progress[courseId],
          ...progressData,
          lastUpdated: new Date().toISOString(),
        },
      };

      setProgress(updatedProgress);
      storageService.saveProgress(courseId, updatedProgress[courseId]);

      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to save progress');
      return false;
    }
  };

  /**
   * Get progress for a specific course
   */
  const getCourseProgress = (courseId) => {
    return progress[courseId] || {
      questionsAnswered: 0,
      correctAnswers: 0,
      totalScore: 0,
      completion: 0,
    };
  };

  /**
   * Clear all data
   */
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storageService.clearAll();
      setWords([]);
      setCurriculum(null);
      setProgress({});
      setActiveCourse(null);
      setSelectedLanguage('Spanish');
      return true;
    }
    return false;
  };

  /**
   * Export data
   */
  const exportData = () => {
    const data = storageService.exportData();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `language-learning-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  /**
   * Import data
   */
  const importData = (jsonData) => {
    try {
      const success = storageService.importData(jsonData);
      if (success) {
        loadFromStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      setError('Failed to import data');
      return false;
    }
  };

  const value = {
    // State
    selectedLanguage,
    words,
    curriculum,
    progress,
    userLevel,
    activeCourse,
    isLoading,
    error,

    // Actions
    addWord,
    deleteWord,
    changeLanguage,
    generateCurriculum,
    selectCourse,
    updateProgress,
    getCourseProgress,
    clearAllData,
    exportData,
    importData,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
