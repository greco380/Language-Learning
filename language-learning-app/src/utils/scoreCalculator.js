// Score calculation utilities for language learning

/**
 * Normalize text for comparison
 */
export const normalizeText = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    // Remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove extra spaces
    .replace(/\s+/g, ' ');
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
export const calculateSimilarity = (str1, str2) => {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

/**
 * Levenshtein distance algorithm
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

/**
 * Convert similarity to percentage score
 */
export const getScorePercentage = (similarity) => {
  return Math.round(similarity * 100);
};

/**
 * Determine if answer is correct based on similarity
 */
export const isAnswerCorrect = (userAnswer, correctAnswer, threshold = 0.7) => {
  const similarity = calculateSimilarity(userAnswer, correctAnswer);
  return similarity >= threshold;
};

/**
 * Determine user level based on progress data
 */
export const determineUserLevel = (progressData) => {
  if (!progressData || Object.keys(progressData).length === 0) {
    return 'beginner';
  }

  // Calculate average score across all courses
  let totalScore = 0;
  let totalQuestions = 0;

  Object.values(progressData).forEach(courseProgress => {
    if (courseProgress.score !== undefined && courseProgress.questionsAnswered !== undefined) {
      totalScore += courseProgress.score * courseProgress.questionsAnswered;
      totalQuestions += courseProgress.questionsAnswered;
    }
  });

  if (totalQuestions === 0) return 'beginner';

  const averageScore = totalScore / totalQuestions;

  if (averageScore >= 80) return 'advanced';
  if (averageScore >= 60) return 'intermediate';
  return 'beginner';
};

/**
 * Calculate course completion percentage
 */
export const calculateCourseCompletion = (courseProgress, totalWords) => {
  if (!courseProgress || !totalWords) return 0;

  const questionsAnswered = courseProgress.questionsAnswered || 0;
  const completion = (questionsAnswered / totalWords) * 100;

  return Math.min(100, Math.round(completion));
};

/**
 * Get performance grade from score
 */
export const getGrade = (score) => {
  if (score >= 90) return { grade: 'A', color: 'text-green-600', label: 'Excellent!' };
  if (score >= 80) return { grade: 'B', color: 'text-blue-600', label: 'Great!' };
  if (score >= 70) return { grade: 'C', color: 'text-yellow-600', label: 'Good!' };
  if (score >= 60) return { grade: 'D', color: 'text-orange-600', label: 'Fair' };
  return { grade: 'F', color: 'text-red-600', label: 'Keep trying!' };
};

/**
 * Calculate streak (consecutive correct answers)
 */
export const calculateStreak = (answerHistory) => {
  if (!answerHistory || answerHistory.length === 0) return 0;

  let streak = 0;
  for (let i = answerHistory.length - 1; i >= 0; i--) {
    if (answerHistory[i].isCorrect) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get motivational message based on performance
 */
export const getMotivationalMessage = (score, streak = 0) => {
  if (streak >= 5) return "🔥 You're on fire! Keep up the amazing streak!";
  if (score >= 90) return "🌟 Outstanding! You're mastering this!";
  if (score >= 80) return "👏 Excellent work! Keep it up!";
  if (score >= 70) return "👍 Good job! You're making progress!";
  if (score >= 60) return "💪 Keep practicing, you're getting there!";
  return "📚 Don't give up! Practice makes perfect!";
};
