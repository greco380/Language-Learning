// Curriculum generation and organization utilities

/**
 * Group words by theme/category
 */
export const groupWordsByTheme = (words) => {
  const themes = {
    greetings: [],
    numbers: [],
    colors: [],
    food: [],
    family: [],
    travel: [],
    shopping: [],
    time: [],
    weather: [],
    emotions: [],
    animals: [],
    body: [],
    home: [],
    work: [],
    hobbies: [],
    other: [],
  };

  const themeKeywords = {
    greetings: ['hello', 'hi', 'goodbye', 'bye', 'please', 'thank', 'sorry', 'excuse', 'welcome'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'zero', 'hundred', 'thousand'],
    colors: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown', 'gray'],
    food: ['food', 'eat', 'drink', 'water', 'bread', 'meat', 'fish', 'fruit', 'vegetable', 'coffee', 'tea', 'breakfast', 'lunch', 'dinner'],
    family: ['mother', 'father', 'sister', 'brother', 'son', 'daughter', 'family', 'parent', 'child', 'grandmother', 'grandfather'],
    travel: ['hotel', 'airport', 'train', 'bus', 'taxi', 'ticket', 'passport', 'luggage', 'trip', 'vacation'],
    shopping: ['buy', 'sell', 'price', 'money', 'store', 'shop', 'market', 'expensive', 'cheap', 'pay'],
    time: ['today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'day', 'hour', 'minute', 'morning', 'afternoon', 'evening', 'night'],
    weather: ['weather', 'sun', 'rain', 'snow', 'wind', 'cloud', 'hot', 'cold', 'warm', 'cool'],
    emotions: ['happy', 'sad', 'angry', 'excited', 'tired', 'bored', 'love', 'hate', 'like', 'fear'],
    animals: ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'chicken', 'animal', 'pet'],
    body: ['head', 'hand', 'foot', 'eye', 'ear', 'nose', 'mouth', 'arm', 'leg', 'body', 'hair'],
    home: ['house', 'home', 'room', 'kitchen', 'bathroom', 'bedroom', 'door', 'window', 'table', 'chair'],
    work: ['work', 'job', 'office', 'boss', 'employee', 'meeting', 'computer', 'phone', 'email'],
    hobbies: ['read', 'write', 'play', 'music', 'sport', 'game', 'movie', 'book', 'dance', 'sing'],
  };

  words.forEach(wordObj => {
    const word = wordObj.word.toLowerCase();
    let categorized = false;

    // Try to match with theme keywords
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => word.includes(keyword))) {
        themes[theme].push(wordObj);
        categorized = true;
        break;
      }
    }

    // If not categorized, put in 'other'
    if (!categorized) {
      themes.other.push(wordObj);
    }
  });

  // Remove empty themes
  const filteredThemes = {};
  for (const [theme, themeWords] of Object.entries(themes)) {
    if (themeWords.length > 0) {
      filteredThemes[theme] = themeWords;
    }
  }

  return filteredThemes;
};

/**
 * Create courses from grouped words
 */
export const createCourses = (groupedWords) => {
  const courses = [];
  let courseId = 1;

  const themeInfo = {
    greetings: { title: 'Essential Greetings', description: 'Master basic greetings and polite expressions', category: 'Basics' },
    numbers: { title: 'Numbers & Counting', description: 'Learn to count and use numbers', category: 'Basics' },
    colors: { title: 'Colors', description: 'Learn color names and descriptions', category: 'Basics' },
    food: { title: 'Food & Dining', description: 'Navigate restaurants and discuss meals', category: 'Daily Life' },
    family: { title: 'Family & Relationships', description: 'Talk about family members and relationships', category: 'Personal' },
    travel: { title: 'Travel & Transportation', description: 'Essential phrases for getting around', category: 'Travel' },
    shopping: { title: 'Shopping & Money', description: 'Shop and handle transactions', category: 'Daily Life' },
    time: { title: 'Time & Dates', description: 'Tell time and discuss schedules', category: 'Basics' },
    weather: { title: 'Weather & Climate', description: 'Discuss weather conditions', category: 'Daily Life' },
    emotions: { title: 'Emotions & Feelings', description: 'Express how you feel', category: 'Personal' },
    animals: { title: 'Animals & Pets', description: 'Talk about animals and pets', category: 'Nature' },
    body: { title: 'Body Parts & Health', description: 'Discuss health and body parts', category: 'Personal' },
    home: { title: 'Home & Living', description: 'Describe your home and furniture', category: 'Daily Life' },
    work: { title: 'Work & Career', description: 'Professional vocabulary and phrases', category: 'Professional' },
    hobbies: { title: 'Hobbies & Interests', description: 'Discuss activities and interests', category: 'Personal' },
    other: { title: 'Vocabulary Collection', description: 'Your recorded words', category: 'Custom' },
  };

  for (const [theme, words] of Object.entries(groupedWords)) {
    const info = themeInfo[theme] || { title: theme, description: 'Learn these words', category: 'Custom' };

    courses.push({
      id: `course-${courseId++}`,
      title: info.title,
      description: info.description,
      category: info.category,
      difficulty: assignDifficulty(words.length, theme),
      words: words.map(w => w.word),
      wordObjects: words,
      wordCount: words.length,
      progress: 0,
    });
  }

  return courses;
};

/**
 * Assign difficulty level to a course
 */
export const assignDifficulty = (wordCount, theme) => {
  const basicThemes = ['greetings', 'numbers', 'colors', 'time'];
  const intermediateThemes = ['food', 'family', 'shopping', 'weather', 'home'];
  const advancedThemes = ['work', 'travel', 'emotions'];

  if (basicThemes.includes(theme)) return 'beginner';
  if (advancedThemes.includes(theme)) return 'advanced';
  if (intermediateThemes.includes(theme)) return 'intermediate';

  // Base on word count
  if (wordCount <= 5) return 'beginner';
  if (wordCount <= 10) return 'intermediate';
  return 'advanced';
};

/**
 * Recommend next course based on user level and progress
 */
export const recommendNextCourse = (userLevel, curriculum, progressData = {}) => {
  if (!curriculum || curriculum.length === 0) return null;

  // Filter courses by user level
  const suitableCourses = curriculum.filter(course => {
    if (userLevel === 'beginner') return course.difficulty === 'beginner';
    if (userLevel === 'intermediate') return course.difficulty === 'beginner' || course.difficulty === 'intermediate';
    return true; // Advanced users can take any course
  });

  // Find courses not yet completed
  const incompleteCourses = suitableCourses.filter(course => {
    const progress = progressData[course.id];
    return !progress || progress.completion < 100;
  });

  if (incompleteCourses.length === 0) {
    return suitableCourses[0]; // Return first suitable course if all are complete
  }

  // Prioritize courses with some progress
  const inProgressCourses = incompleteCourses.filter(course => {
    const progress = progressData[course.id];
    return progress && progress.completion > 0 && progress.completion < 100;
  });

  if (inProgressCourses.length > 0) {
    return inProgressCourses[0];
  }

  // Return first incomplete course
  return incompleteCourses[0];
};

/**
 * Get difficulty badge color
 */
export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Sort courses by recommended order
 */
export const sortCoursesByRecommendation = (courses, userLevel) => {
  const levelPriority = {
    beginner: { beginner: 1, intermediate: 2, advanced: 3 },
    intermediate: { beginner: 2, intermediate: 1, advanced: 3 },
    advanced: { beginner: 3, intermediate: 2, advanced: 1 },
  };

  return [...courses].sort((a, b) => {
    const priorityA = levelPriority[userLevel]?.[a.difficulty] || 4;
    const priorityB = levelPriority[userLevel]?.[b.difficulty] || 4;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Secondary sort by word count (fewer words first)
    return a.wordCount - b.wordCount;
  });
};
