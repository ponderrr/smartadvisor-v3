
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { generateQuestionsWithRetry } from "@/services/openai";
import { Question } from "@/types/Question";
import { Answer } from "@/types/Answer";

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get contentType from navigation state
  const { contentType } = location.state || {};

  useEffect(() => {
    // Redirect if no contentType or user
    if (!contentType || !user) {
      navigate("/content-selection");
      return;
    }

    // Generate AI questions
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Generating AI questions for:', { contentType, userAge: user.age });
        
        const aiQuestions = await generateQuestionsWithRetry(contentType, user.age);
        
        if (!aiQuestions || aiQuestions.length === 0) {
          throw new Error('No questions were generated');
        }
        
        setQuestions(aiQuestions);
        console.log('Questions loaded successfully:', aiQuestions.length);
      } catch (error) {
        console.error("Error generating questions:", error);
        setError(error instanceof Error ? error.message : "Failed to generate questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [contentType, user, navigate]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Convert answers to Answer format
      const formattedAnswers: Answer[] = questions.map(question => ({
        question_id: question.id,
        answer_text: answers[question.id] || '',
        user_id: user!.id,
        created_at: new Date().toISOString()
      }));

      // Navigate to results page
      navigate("/results", {
        state: {
          contentType,
          answers: formattedAnswers,
          questions
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate("/content-selection");
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (!contentType || !user) {
    return null; // Redirect will happen in useEffect
  }

  // Loading state
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-appAccent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-textSecondary text-[15px]">
              Hi, {user.name}
            </span>
          </div>
        </header>

        {/* Loading Content */}
        <main className="flex flex-col items-center justify-center px-6 pt-[120px] pb-[100px]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-appAccent animate-spin mx-auto mb-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Generating Your Questions
            </h1>
            <p className="text-lg text-textSecondary mb-4">
              Our AI is creating personalized questions based on your preferences for{" "}
              {contentType === 'both' ? 'movies and books' : contentType}...
            </p>
            <div className="text-sm text-textTertiary">
              This may take a few seconds
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-appAccent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-textSecondary text-[15px]">
              Hi, {user.name}
            </span>
          </div>
        </header>

        {/* Error Content */}
        <main className="flex flex-col items-center justify-center px-6 pt-[120px] pb-[100px]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Unable to Generate Questions
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

  // Main questionnaire content
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const canProceed = answers[currentQuestion.id]?.trim().length > 0;

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-appAccent rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-textSecondary text-[15px]">
            Hi, {user.name}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-[80px] md:pt-[120px] pb-[100px]">
        {/* Progress Indicator */}
        <div className="text-center text-textTertiary text-sm mb-8">
          Step 2 of 3 • Question {currentQuestionIndex + 1} of {questions.length}
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="w-full bg-appSecondary rounded-full h-2">
            <div
              className="bg-appAccent h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-appSecondary border border-gray-700 rounded-2xl p-8 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-textPrimary mb-6">
              {currentQuestion.text}
            </h1>
            <p className="text-textSecondary mb-6">
              Take your time to think about your answer. The more details you provide, the better we can tailor our recommendation.
            </p>
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full h-32 p-4 bg-appPrimary border border-gray-600 rounded-lg text-textPrimary placeholder-textTertiary resize-none focus:outline-none focus:border-appAccent transition-colors duration-200"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 bg-appSecondary border border-gray-700 text-textPrimary px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                canProceed
                  ? "bg-appAccent text-white hover:bg-opacity-90"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Get Recommendations' : 'Next'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionnairePage;
