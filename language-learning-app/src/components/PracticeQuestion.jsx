import React, { useState } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

const PracticeQuestion = ({ question, onAnswer, onNext, questionNumber, totalQuestions }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitted) return;

    let answer = '';

    if (question.type === 'multiple_choice') {
      answer = selectedOption;
    } else {
      answer = userAnswer.trim();
    }

    if (!answer) return;

    // Submit answer
    const result = onAnswer(answer, question);

    setFeedback(result);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setUserAnswer('');
    setSelectedOption(null);
    setFeedback(null);
    setIsSubmitted(false);
    onNext();
  };

  const handleOptionSelect = (option) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const getOptionStyle = (option) => {
    if (!isSubmitted) {
      return selectedOption === option
        ? 'bg-primary-100 border-primary-500 text-primary-700'
        : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400';
    }

    // After submission
    const isCorrect = option === question.correctAnswer;
    const isSelected = option === selectedOption;

    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-700';
    }

    if (isSelected && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-700';
    }

    return 'bg-gray-50 border-gray-300 text-gray-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="card">
        {/* Question Type Badge */}
        <div className="mb-4">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full uppercase">
            {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Translation'}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {question.question}
        </h2>

        {/* Answer Input */}
        <form onSubmit={handleSubmit}>
          {question.type === 'multiple_choice' && question.options ? (
            // Multiple Choice Options
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  disabled={isSubmitted}
                  className={`w-full p-4 border-2 rounded-lg text-left font-medium transition-all duration-200 ${getOptionStyle(
                    option
                  )} ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isSubmitted && option === question.correctAnswer && (
                      <Check size={20} className="text-green-600" />
                    )}
                    {isSubmitted &&
                      option === selectedOption &&
                      option !== question.correctAnswer && (
                        <X size={20} className="text-red-600" />
                      )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Text Input
            <div className="mb-6">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitted}
                placeholder="Type your answer..."
                className={`input-field text-lg ${
                  isSubmitted
                    ? feedback?.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : ''
                }`}
                autoFocus
              />
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                feedback.isCorrect
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {feedback.isCorrect ? (
                  <Check size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <X size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`font-semibold mb-1 ${
                      feedback.isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p
                    className={`text-sm ${
                      feedback.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {feedback.feedback}
                  </p>
                  {feedback.score !== undefined && (
                    <p
                      className={`text-sm font-medium mt-1 ${
                        feedback.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      Score: {feedback.score}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isSubmitted ? (
              <button
                type="submit"
                disabled={
                  question.type === 'multiple_choice'
                    ? !selectedOption
                    : !userAnswer.trim()
                }
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PracticeQuestion;
