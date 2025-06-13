import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { openaiService } from "@/services/openai";
import { Question } from "@/types/Question";

interface Answer {
  questionId: string;
  value: string | number;
}

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get content type from navigation state
  const contentType = location.state?.contentType as 'movie' | 'book' | 'both';

  // Generate questions on page load
  useEffect(() => {
    if (!contentType) {
      navigate('/content-selection');
      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Generating questions for:', { contentType, userAge: user?.age });
        
        const generatedQuestions = await openaiService.generateQuestions(
          contentType, 
          user?.age || 25
        );
        
        console.log('Questions generated:', generatedQuestions);
        setQuestions(generatedQuestions);
      } catch (err) {
        console.error('Error generating questions:', err);
        setError('Failed to generate questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [contentType, user?.age, navigate]);

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
    // Convert answers to the format expected by the results page
    const formattedAnswers = answers.map(a => ({
      question_id: a.questionId,
      answer_text: a.value.toString(),
      user_id: user?.id || '',
      created_at: new Date().toISOString()
    }));

    // Navigate to results with answers and content type
    navigate('/results', {
      state: {
        contentType,
        answers: formattedAnswers,
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

  const handleRetry = () => {
    window.location.reload();
  };

  if (!contentType) {
    return null; // Redirect will happen in useEffect
  }

  if (loading) {
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

        {/* Loading Content */}
        <main className="flex flex-col items-center justify-center px-6 pt-[120px] pb-[100px]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-appAccent animate-spin mx-auto mb-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Generating Your Questions
            </h1>
            <p className="text-lg text-textSecondary">
              Our AI is creating personalized questions based on your preferences...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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

        {/* Error Content */}
        <main className="flex flex-col items-center justify-center px-6 pt-[120px] pb-[100px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-white text-2xl">!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-textSecondary mb-8">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="bg-appAccent text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/content-selection')}
                className="bg-appSecondary border border-gray-700 text-textPrimary px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canProceed = currentAnswer !== undefined && currentAnswer !== '';

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

          {/* Answer Input */}
          <div className="space-y-4">
            <textarea
              value={currentAnswer as string || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 bg-appSecondary border border-gray-700 rounded-lg text-textPrimary placeholder:text-textTertiary focus:outline-none focus:border-appAccent transition-colors duration-200 min-h-[120px] resize-none"
              rows={4}
            />
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
