import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, Award, AlertCircle } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { useAppContext } from '../context/AppContext';
import { recommendNextCourse, sortCoursesByRecommendation } from '../utils/curriculumGenerator';

const CurriculumPage = () => {
  const {
    curriculum,
    generateCurriculum,
    selectCourse,
    progress,
    userLevel,
    words,
    isLoading,
  } = useAppContext();

  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate curriculum on mount if not available
  useEffect(() => {
    if (!curriculum) {
      handleGenerateCurriculum();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateCurriculum = async (force = false) => {
    setIsGenerating(true);
    try {
      await generateCurriculum(force);
    } catch (error) {
      console.error('Error generating curriculum:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectCourse = (course) => {
    selectCourse(course);
    navigate('/practice');
  };

  // Get recommended course
  const recommendedCourse = curriculum
    ? recommendNextCourse(userLevel, curriculum, progress)
    : null;

  // Sort courses by recommendation
  const sortedCourses = curriculum
    ? sortCoursesByRecommendation(curriculum, userLevel)
    : [];

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!curriculum || curriculum.length === 0) return 0;

    const totalProgress = curriculum.reduce((acc, course) => {
      const courseProgress = progress[course.id];
      return acc + (courseProgress?.completion || 0);
    }, 0);

    return Math.round(totalProgress / curriculum.length);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Curriculum
          </h1>
          <p className="text-gray-600">
            Personalized courses based on your vocabulary
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">
                {curriculum?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {overallProgress}%
              </p>
              <p className="text-sm text-gray-600">Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {userLevel}
              </p>
              <p className="text-sm text-gray-600">Level</p>
            </div>
          </div>
        </div>

        {/* Regenerate Button */}
        {curriculum && curriculum.length > 0 && (
          <button
            onClick={() => handleGenerateCurriculum(true)}
            disabled={isGenerating}
            className="w-full mb-6 btn-secondary flex items-center justify-center gap-2"
          >
            <RefreshCw
              size={18}
              className={isGenerating ? 'animate-spin' : ''}
            />
            <span>{isGenerating ? 'Regenerating...' : 'Regenerate Curriculum'}</span>
          </button>
        )}

        {/* Loading State */}
        {(isLoading || isGenerating) && !curriculum && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <RefreshCw className="mx-auto mb-4 text-primary-600 animate-spin" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generating Your Curriculum
            </h3>
            <p className="text-gray-600">
              Creating personalized courses from your vocabulary...
            </p>
          </div>
        )}

        {/* Recommended Course */}
        {!isLoading && !isGenerating && recommendedCourse && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-yellow-500" size={24} />
              <h2 className="text-xl font-bold text-gray-900">
                Recommended for You
              </h2>
            </div>
            <div className="ring-2 ring-primary-400 rounded-xl">
              <CourseCard
                course={recommendedCourse}
                onSelect={handleSelectCourse}
                progress={progress[recommendedCourse.id]}
              />
            </div>
          </div>
        )}

        {/* Course List */}
        {!isLoading && !isGenerating && sortedCourses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              All Courses
            </h2>
            <div className="space-y-3">
              {sortedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onSelect={handleSelectCourse}
                  progress={progress[course.id]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - No Words */}
        {!isLoading && !isGenerating && words.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Curriculum Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start recording words to generate your personalized learning curriculum
            </p>
            <a href="/" className="inline-block btn-primary">
              Record Words
            </a>
          </div>
        )}

        {/* Achievement Badge */}
        {overallProgress === 100 && curriculum && curriculum.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-green-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
            <Award className="mx-auto mb-3 text-yellow-600" size={48} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-gray-700">
              You've completed all courses in your curriculum!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurriculumPage;
