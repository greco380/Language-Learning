// OpenAI API service for language processing and curriculum generation

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_MODEL = process.env.REACT_APP_OPENAI_MODEL || 'gpt-3.5-turbo';
const API_BASE_URL = process.env.REACT_APP_OPENAI_BASE_URL || 'https://api.openai.com/v1';

class OpenAIService {
  constructor() {
    this.apiKey = API_KEY;
    this.model = API_MODEL;
    this.baseUrl = API_BASE_URL;
  }

  async makeRequest(messages, temperature = 0.7, maxTokens = 1000) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please add REACT_APP_OPENAI_API_KEY to your .env file.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  /**
   * Extract word and language from user's transcription
   * Expected format: "Please say [word] in [language]" or similar variations
   */
  async extractWordAndLanguage(transcription, defaultLanguage = 'Spanish') {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are a language learning assistant. Extract the word/phrase and target language from the user's request.
          Return ONLY a JSON object with this exact format: {"word": "the word or phrase", "language": "the language name"}
          If the language is not specified, use "${defaultLanguage}".
          If the request is unclear, make your best guess.`
        },
        {
          role: 'user',
          content: transcription
        }
      ];

      const response = await this.makeRequest(messages, 0.3, 100);

      // Parse the JSON response
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          word: result.word || '',
          language: result.language || defaultLanguage,
          originalTranscription: transcription,
        };
      }

      // Fallback parsing
      return this.fallbackExtraction(transcription, defaultLanguage);
    } catch (error) {
      console.error('Error extracting word and language:', error);
      return this.fallbackExtraction(transcription, defaultLanguage);
    }
  }

  /**
   * Fallback extraction using simple pattern matching
   */
  fallbackExtraction(transcription, defaultLanguage) {
    const lowerText = transcription.toLowerCase();

    // Try to extract language
    const languages = ['spanish', 'french', 'german', 'italian', 'portuguese', 'japanese', 'chinese', 'korean', 'russian', 'arabic'];
    let detectedLanguage = defaultLanguage;

    for (const lang of languages) {
      if (lowerText.includes(lang)) {
        detectedLanguage = lang.charAt(0).toUpperCase() + lang.slice(1);
        break;
      }
    }

    // Try to extract the word (look for quotes or keywords)
    let word = transcription;
    const quoteMatch = transcription.match(/["']([^"']+)["']/);
    if (quoteMatch) {
      word = quoteMatch[1];
    } else {
      // Remove common phrases
      word = transcription
        .replace(/please say/i, '')
        .replace(/how do you say/i, '')
        .replace(/what is/i, '')
        .replace(/in (spanish|french|german|italian|portuguese|japanese|chinese|korean|russian|arabic)/i, '')
        .trim();
    }

    return {
      word: word,
      language: detectedLanguage,
      originalTranscription: transcription,
    };
  }

  /**
   * Generate a structured curriculum from a list of words
   */
  async generateCurriculum(words) {
    if (!words || words.length === 0) {
      return this.getDefaultCurriculum();
    }

    try {
      // Build word list handling both formats
      const wordList = words.map(w => {
        if (w.foreignWord && w.nativeWord) {
          return `${w.nativeWord.text} (${w.nativeWord.language}) = ${w.foreignWord.text} (${w.foreignWord.language})`;
        }
        return `${w.word} (${w.language})`;
      }).join(', ');

      const messages = [
        {
          role: 'system',
          content: `You are a language curriculum designer. Organize the given words into themed courses.
          Return a JSON array of courses. Each course should have:
          - id: unique identifier
          - title: course name
          - description: brief description
          - category: theme (e.g., "Basics", "Food", "Travel")
          - difficulty: "beginner", "intermediate", or "advanced"
          - words: array of words in this course (use the native language words)

          Group similar words together into logical courses of 5-10 words each.`
        },
        {
          role: 'user',
          content: `Create a curriculum from these words: ${wordList}`
        }
      ];

      const response = await this.makeRequest(messages, 0.7, 2000);

      // Parse JSON array
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const curriculum = JSON.parse(jsonMatch[0]);
        return curriculum.map((course, index) => {
          // Map the word strings back to word objects
          const wordObjects = course.words.map(wordStr => {
            return words.find(w => {
              if (w.foreignWord && w.nativeWord) {
                return w.nativeWord.text.toLowerCase() === wordStr.toLowerCase() ||
                       w.foreignWord.text.toLowerCase() === wordStr.toLowerCase();
              }
              return w.word.toLowerCase() === wordStr.toLowerCase();
            });
          }).filter(Boolean);

          return {
            ...course,
            id: course.id || `course-${index}`,
            wordCount: course.words?.length || 0,
            wordObjects: wordObjects,
          };
        });
      }

      return this.getDefaultCurriculum();
    } catch (error) {
      console.error('Error generating curriculum:', error);
      return this.getDefaultCurriculum();
    }
  }

  /**
   * Default curriculum when generation fails or no words exist
   */
  getDefaultCurriculum() {
    return [
      {
        id: 'basics-1',
        title: 'Essential Greetings',
        description: 'Start with basic greetings and introductions',
        category: 'Basics',
        difficulty: 'beginner',
        words: ['hello', 'goodbye', 'please', 'thank you', 'yes', 'no'],
        wordCount: 6,
      },
      {
        id: 'basics-2',
        title: 'Numbers 1-10',
        description: 'Learn to count from one to ten',
        category: 'Basics',
        difficulty: 'beginner',
        words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
        wordCount: 10,
      }
    ];
  }

  /**
   * Generate practice questions for a course
   */
  async generatePracticeQuestions(course, count = 5) {
    try {
      // Build word pairs information for the prompt
      const wordPairs = course.wordObjects.map(w => {
        if (w.foreignWord && w.nativeWord) {
          return `${w.nativeWord.text} (${w.nativeWord.language}) = ${w.foreignWord.text} (${w.foreignWord.language})`;
        } else {
          // Legacy format
          return `${w.word} (${w.language})`;
        }
      }).join(', ');

      const messages = [
        {
          role: 'system',
          content: `You are a language learning quiz generator. Create practice questions that alternate between two directions:

          1. Native to Foreign: Show the native language word and ask for the foreign language translation
             Example: "What is the Spanish word for 'hello'? Answer in Spanish:"

          2. Foreign to Native: Show the foreign language word and ask for the native language translation
             Example: "What does 'Hola' mean? Answer in English:"

          IMPORTANT:
          - The question must clearly state which language the answer should be in
          - Alternate between both directions
          - Do NOT show the answer in the question text
          - For Native→Foreign questions, show the native word and ask for foreign
          - For Foreign→Native questions, show the foreign word and ask for native

          Return a JSON array of questions. Each question should have:
          - id: unique identifier
          - type: "translation", "multiple_choice", or "fill_blank"
          - question: the question text (must clearly indicate answer language)
          - correctAnswer: the correct answer
          - options: array of 4 options (for multiple choice)
          - wordId: the ID or index of the word being tested
          - direction: "native_to_foreign" or "foreign_to_native"
          - answerLanguage: the language expected for the answer`
        },
        {
          role: 'user',
          content: `Create ${count} practice questions for these word pairs: ${wordPairs}.
          Course: ${course.title}. Difficulty: ${course.difficulty}.
          Make sure to alternate between asking for the foreign language translation and the native language translation.`
        }
      ];

      const response = await this.makeRequest(messages, 0.8, 1500);

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        // Attach word objects to questions for audio access
        return questions.map(q => {
          const wordObj = course.wordObjects.find((w, idx) =>
            q.wordId === idx ||
            (w.foreignWord && (w.foreignWord.text === q.correctAnswer || w.nativeWord.text === q.correctAnswer))
          ) || course.wordObjects[0];

          return {
            ...q,
            wordObject: wordObj
          };
        });
      }

      // Fallback: generate simple translation questions
      return this.generateFallbackQuestions(course.wordObjects, count);
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.generateFallbackQuestions(course.wordObjects, count);
    }
  }

  /**
   * Fallback question generation
   */
  generateFallbackQuestions(wordObjects, count) {
    const selectedWords = wordObjects.slice(0, count);
    return selectedWords.map((wordObj, index) => {
      // Determine direction (alternate between native→foreign and foreign→native)
      const isNativeToForeign = index % 2 === 0;

      let question, correctAnswer, answerLanguage, direction;

      if (wordObj.foreignWord && wordObj.nativeWord) {
        // New format: use bidirectional questions
        if (isNativeToForeign) {
          // Native → Foreign
          question = `What is the ${wordObj.foreignWord.language} word for "${wordObj.nativeWord.text}"? Answer in ${wordObj.foreignWord.language}:`;
          correctAnswer = wordObj.foreignWord.text;
          answerLanguage = wordObj.foreignWord.language;
          direction = 'native_to_foreign';
        } else {
          // Foreign → Native
          question = `What does "${wordObj.foreignWord.text}" mean? Answer in ${wordObj.nativeWord.language}:`;
          correctAnswer = wordObj.nativeWord.text;
          answerLanguage = wordObj.nativeWord.language;
          direction = 'foreign_to_native';
        }
      } else {
        // Legacy format: simple translation question
        question = `How do you say "${wordObj.word}" in ${wordObj.language}?`;
        correctAnswer = wordObj.word;
        answerLanguage = wordObj.language;
        direction = 'native_to_foreign';
      }

      return {
        id: `q-${index}`,
        type: 'translation',
        question: question,
        correctAnswer: correctAnswer,
        answerLanguage: answerLanguage,
        direction: direction,
        wordObject: wordObj
      };
    });
  }

  /**
   * Score a user's answer against the correct answer
   */
  async scoreAnswer(userAnswer, correctAnswer, context = '') {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are a language learning grading assistant. Compare the user's answer with the correct answer.
          Return a JSON object with:
          - score: number from 0 to 100
          - isCorrect: boolean (true if score >= 70)
          - feedback: brief explanation

          Be lenient with minor spelling mistakes and accept reasonable variations.`
        },
        {
          role: 'user',
          content: `User's answer: "${userAnswer}"
          Correct answer: "${correctAnswer}"
          ${context ? `Context: ${context}` : ''}`
        }
      ];

      const response = await this.makeRequest(messages, 0.3, 200);

      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback scoring
      return this.fallbackScoring(userAnswer, correctAnswer);
    } catch (error) {
      console.error('Error scoring answer:', error);
      return this.fallbackScoring(userAnswer, correctAnswer);
    }
  }

  /**
   * Fallback scoring using simple string comparison
   */
  fallbackScoring(userAnswer, correctAnswer) {
    const normalize = (str) => str.toLowerCase().trim();
    const user = normalize(userAnswer);
    const correct = normalize(correctAnswer);

    if (user === correct) {
      return { score: 100, isCorrect: true, feedback: 'Perfect!' };
    }

    // Calculate similarity (simple version)
    const similarity = this.calculateSimilarity(user, correct);
    const score = Math.round(similarity * 100);

    return {
      score: score,
      isCorrect: score >= 70,
      feedback: score >= 70 ? 'Good job!' : `Close! The correct answer is: ${correctAnswer}`,
    };
  }

  /**
   * Calculate string similarity (Levenshtein-based)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
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
  }
}

export default new OpenAIService();
