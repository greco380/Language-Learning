import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, X, AlertCircle, Loader } from 'lucide-react';
import PracticeQuestion from '../components/PracticeQuestion';
import { useAppContext } from '../context/AppContext';
import openaiService from '../services/openaiService';
import { getMotivationalMessage } from '../utils/scoreCalculator';

const PracticePage = () => {
  const {
    activeCourse,
    curriculum,
    generateCurriculum,
    updateProgress,
    getCourseProgress,
    selectCourse,
  } = useAppContext();

  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Initialize practice session
  useEffect(() => {
    initializePractice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourse]);

  const initializePractice = async () => {
    setIsLoading(true);

    try {
      let courseToUse = activeCourse;

      // If no active course, generate curriculum and use first course
      if (!courseToUse) {
        if (!curriculum || curriculum.length === 0) {
          await generateCurriculum();
        }

        if (curriculum && curriculum.length > 0) {
          courseToUse = curriculum[0];
          selectCourse(courseToUse);
        } else {
          setIsLoading(false);
          return;
        }
      }

      // Generate practice questions
      const generatedQuestions = await openaiService.generatePracticeQuestions(
        courseToUse,
        10
      );

      setQuestions(generatedQuestions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing practice:', error);
      setIsLoading(false);
    }
  };

  const handleAnswer = async (userAnswer, question) => {
    try {
      // Score the answer
      const result = await openaiService.scoreAnswer(
        userAnswer,
        question.correctAnswer,
        question.question
      );

      // Update session stats
      setSessionScore((prev) => prev + result.score);

      if (result.isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Add to answer history
      setAnswerHistory((prev) => [
        ...prev,
        {
          question: question.question,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect: result.isCorrect,
          score: result.score,
        },
      ]);

      return result;
    } catch (error) {
      console.error('Error scoring answer:', error);
      // Fallback scoring
      const isCorrect =
        userAnswer.toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim();

      return {
        score: isCorrect ? 100 : 0,
        isCorrect,
        feedback: isCorrect
          ? 'Correct!'
          : `The correct answer is: ${question.correctAnswer}`,
      };
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // End of quiz
      finishPractice();
    }
  };

  const finishPractice = () => {
    // Calculate final stats
    const averageScore = Math.round(sessionScore / questions.length);

    // Update course progress
    if (activeCourse) {
      const currentProgress = getCourseProgress(activeCourse.id);

      updateProgress(activeCourse.id, {
        questionsAnswered:
          (currentProgress.questionsAnswered || 0) + questions.length,
        correctAnswers:
          (currentProgress.correctAnswers || 0) + correctAnswers,
        totalScore: (currentProgress.totalScore || 0) + sessionScore,
        completion: Math.min(
          100,
          ((currentProgress.questionsAnswered || 0) + questions.length) /
            (activeCourse.wordCount || 10) *
            100
        ),
        averageScore,
      });
    }

    setShowResults(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSessionScore(0);
    setCorrectAnswers(0);
    setAnswerHistory([]);
    setShowResults(false);
    initializePractice();
  };

  const handleExit = () => {
    navigate('/curriculum');
  };

  const averageScore = questions.length > 0 ? Math.round(sessionScore / questions.length) : 0;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 pt-6 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto mb-4 text-primary-600 animate-spin" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Preparing Your Practice
          </h3>
          <p className="text-gray-600">Generating questions...</p>
        </div>
      </div>
    );
  }

  // No Questions Available
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen pb-20 pt-6 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Practice Available
            </h3>
            <p className="text-gray-600 mb-6">
              You need to record some words first or select a course from the curriculum
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/" className="btn-primary">
                Record Words
              </a>
              <a href="/curriculum" className="btn-secondary">
                View Curriculum
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    return (
      <div className="min-h-screen pb-20 pt-6 px-4 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            {/* Trophy */}
            <div className="mb-6">
              <Trophy
                className={`mx-auto ${
                  averageScore >= 80
                    ? 'text-yellow-500'
                    : averageScore >= 60
                    ? 'text-gray-400'
                    : 'text-orange-400'
                }`}
                size={64}
              />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Practice Complete!
            </h2>

            {/* Motivational Message */}
            <p className="text-lg text-gray-600 mb-8">
              {getMotivationalMessage(averageScore, 0)}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-primary-600">
                  {correctAnswers}/{questions.length}
                </p>
                <p className="text-sm text-gray-600">Correct</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {averageScore}%
                </p>
                <p className="text-sm text-gray-600">Score</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {questions.length}
                </p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
            </div>

            {/* Answer Review */}
            <div className="mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Review:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {answerHistory.map((answer, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      answer.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Q{index + 1}: {answer.question}
                    </p>
                    <p className="text-xs text-gray-600">
                      Your answer: <span className="font-medium">{answer.userAnswer}</span>
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-xs text-gray-600">
                        Correct: <span className="font-medium">{answer.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleRestart} className="btn-primary flex-1">
                Practice Again
              </button>
              <button onClick={handleExit} className="btn-secondary flex-1">
                Back to Curriculum
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice Session
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeCourse?.title || 'Practice Session'}
            </h1>
            <p className="text-gray-600">
              Score: {correctAnswers}/{currentQuestionIndex} correct
            </p>
          </div>
          <button
            onClick={handleExit}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Exit practice"
          >
            <X size={24} />
          </button>
        </div>

        {/* Practice Question */}
        <PracticeQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          onNext={handleNext}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </div>
    </div>
  );
};

export default PracticePage;
