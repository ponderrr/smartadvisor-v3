
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text' | 'rating';
  options?: string[];
}

interface Answer {
  questionId: string;
  value: string | number;
}

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);

  // Get content type from navigation state
  const contentType = location.state?.contentType as 'movie' | 'book' | 'both';

  // Mock questions - in real app, these would come from OpenAI
  const questions: Question[] = [
    {
      id: 'q1',
      text: 'What genre do you typically enjoy?',
      type: 'multiple-choice',
      options: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller']
    },
    {
      id: 'q2',
      text: 'How would you rate your interest in character development?',
      type: 'rating'
    },
    {
      id: 'q3',
      text: 'What mood are you in for today?',
      type: 'multiple-choice',
      options: ['Adventurous', 'Relaxed', 'Emotional', 'Thoughtful', 'Energetic']
    },
    {
      id: 'q4',
      text: 'Describe any specific themes or topics you\'d like to explore:',
      type: 'text'
    },
    {
      id: 'q5',
      text: 'How important is critical acclaim to you?',
      type: 'rating'
    }
  ];

  // Redirect if no content type
  useEffect(() => {
    if (!contentType) {
      navigate('/content-selection');
    }
  }, [contentType, navigate]);

  // Check for unsaved data
  useEffect(() => {
    setHasUnsavedData(answers.length > 0);
  }, [answers]);

  const handleLogoClick = () => {
    if (hasUnsavedData) {
      const confirmed = window.confirm('You have unsaved progress. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    navigate("/");
  };

  const handleAnswerChange = (value: string | number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = answers.filter(a => a.questionId !== currentQuestion.id);
    newAnswers.push({ questionId: currentQuestion.id, value });
    setAnswers(newAnswers);
  };

  const getCurrentAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return answers.find(a => a.questionId === currentQuestion.id)?.value;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    // Navigate to results with answers and content type
    navigate('/results', {
      state: {
        contentType,
        answers,
        questions
      }
    });
  };

  const handleSignOut = async () => {
    if (hasUnsavedData) {
      const confirmed = window.confirm('You have unsaved progress. Are you sure you want to sign out?');
      if (!confirmed) return;
    }
    await signOut();
    navigate("/");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = currentAnswer !== undefined;

  if (!contentType) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="bg-appPrimary text-textPrimary font-inter min-h-screen">
      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-6 md:px-12 bg-appPrimary">
        <button
          onClick={handleLogoClick}
          className="text-textPrimary text-xl font-medium cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          Smart Advisor
        </button>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-8 h-8 bg-appAccent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-textSecondary text-[15px]">
              Hi, {user?.name}
            </span>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-appSecondary border border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => navigate("/history")}
                className="w-full flex items-center gap-2 px-4 py-3 text-textSecondary hover:text-textPrimary hover:bg-gray-700 transition-colors duration-200"
              >
                <User size={16} />
                View History
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 text-textSecondary hover:text-textPrimary hover:bg-gray-700 transition-colors duration-200 border-t border-gray-700"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-6 pt-[80px] md:pt-[120px] pb-[100px]">
        {/* Progress Indicator */}
        <div className="text-textTertiary text-sm mb-8">
          Step 2 of 3 • Question {currentQuestionIndex + 1} of {questions.length}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-[600px] bg-gray-700 rounded-full h-2 mb-12">
          <div
            className="bg-appAccent h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="max-w-[600px] w-full text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-8">
            {currentQuestion.text}
          </h1>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerChange(option)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentAnswer === option
                    ? 'bg-appAccent border-appAccent text-white'
                    : 'bg-appSecondary border-gray-700 text-textPrimary hover:border-appAccent'
                }`}
              >
                {option}
              </button>
            ))}

            {currentQuestion.type === 'rating' && (
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswerChange(rating)}
                    className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                      currentAnswer === rating
                        ? 'bg-appAccent border-appAccent text-white'
                        : 'bg-appSecondary border-gray-700 text-textPrimary hover:border-appAccent'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'text' && (
              <textarea
                value={currentAnswer as string || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full p-4 bg-appSecondary border border-gray-700 rounded-lg text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-appAccent transition-colors duration-200"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 ${
              currentQuestionIndex === 0
                ? 'border-gray-700 text-textTertiary cursor-not-allowed'
                : 'border-gray-600 text-textSecondary hover:border-appAccent hover:text-textPrimary'
            }`}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleFinish}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                canProceed
                  ? 'bg-appAccent text-white hover:bg-opacity-90'
                  : 'bg-gray-700 text-textTertiary cursor-not-allowed'
              }`}
            >
              Get My Recommendations
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                canProceed
                  ? 'bg-appAccent text-white hover:bg-opacity-90'
                  : 'bg-gray-700 text-textTertiary cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuestionnairePage;
