import React from 'react';
import { BookOpen, Award, ChevronRight } from 'lucide-react';
import { getDifficultyColor } from '../utils/curriculumGenerator';

const CourseCard = ({ course, onSelect, progress }) => {
  const { title, description, category, difficulty, wordCount } = course;

  const progressPercentage = progress?.completion || 0;
  const isStarted = progressPercentage > 0;
  const isCompleted = progressPercentage >= 100;

  return (
    <button
      onClick={() => onSelect(course)}
      className="w-full card hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category & Difficulty */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
              {category}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(
                difficulty
              )}`}
            >
              {difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <BookOpen size={20} className="text-primary-600 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Word Count */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-700">
              <span className="font-semibold">{wordCount}</span> words
            </span>

            {/* Progress Badge */}
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <Award size={16} />
                <span>Completed</span>
              </div>
            )}
            {isStarted && !isCompleted && (
              <span className="text-primary-600 font-medium">
                {progressPercentage}% complete
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {isStarted && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0 self-center">
          <ChevronRight size={24} className="text-gray-400" />
        </div>
      </div>
    </button>
  );
};

export default CourseCard;
