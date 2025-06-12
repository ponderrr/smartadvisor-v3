import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Loader2 } from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: "text" | "multiple-choice";
  options?: string[];
}

interface QuestionnaireState {
  contentType: "movie" | "book" | "both";
}

interface Answer {
  questionId: number;
  answer: string;
}

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get content type from navigation state
  const state = location.state as QuestionnaireState;
  const contentType = state?.contentType || "both";

  // Current question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Mock user data - replace with actual user context
  const user = {
    name: "John Doe",
    avatar: null,
  };

  // Mock questions - in real app, these would be AI-generated based on contentType and user age
  const questions: Question[] = [
    {
      id: 1,
      text: "What's your favorite genre, and what draws you to it?",
      type: "text",
    },
    {
      id: 2,
      text: "Do you prefer stories with happy endings or more complex, thought-provoking conclusions?",
      type: "text",
    },
    {
      id: 3,
      text: "Tell us about a recent book or movie you absolutely loved and why",
      type: "text",
    },
    {
      id: 4,
      text: "What mood are you in for your next recommendation - something light and fun, or deep and meaningful?",
      type: "text",
    },
    {
      id: 5,
      text: "Are there any themes, settings, or time periods that especially interest you right now?",
      type: "text",
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const characterCount = currentAnswer.length;
  const maxLength = 500;

  useEffect(() => {
    // Auto-focus textarea when question changes
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Load saved answer for current question
    const savedAnswers = answers.find(
      (a) => a.questionId === currentQuestion.id
    );
    if (savedAnswers) {
      setCurrentAnswer(savedAnswers.answer);
    } else {
      setCurrentAnswer("");
    }
  }, [currentQuestionIndex, answers, currentQuestion.id]);

  useEffect(() => {
    // Warn user before leaving page
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message =
        "You will lose your progress if you leave the page. Are you sure?";
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleLogoClick = () => {
    if (
      window.confirm("You will lose your progress if you leave. Are you sure?")
    ) {
      navigate("/");
    }
  };

  const saveCurrentAnswer = () => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
      return [
        ...filtered,
        { questionId: currentQuestion.id, answer: currentAnswer },
      ];
    });
  };

  const handleBack = async () => {
    if (currentQuestionIndex === 0) return;

    saveCurrentAnswer();
    setIsNavigating(true);

    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 500));

    setCurrentQuestionIndex((prev) => prev - 1);
    setIsNavigating(false);
  };

  const handleNext = async () => {
    saveCurrentAnswer();
    setIsNavigating(true);

    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentQuestionIndex === questions.length - 1) {
      // Last question - proceed to results
      const finalAnswers = [
        ...answers.filter((a) => a.questionId !== currentQuestion.id),
        { questionId: currentQuestion.id, answer: currentAnswer },
      ];

      navigate("/results", {
        state: {
          contentType,
          answers: finalAnswers,
        },
      });
    } else {
      // Next question
      setCurrentQuestionIndex((prev) => prev + 1);
    }

    setIsNavigating(false);
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
  };

  const isAnswerValid = currentAnswer.trim().length > 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

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

        {/* Progress Indicator */}
        <div className="flex flex-col items-center">
          <span className="text-[14px] font-medium text-textSecondary mb-1">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="w-[150px] md:w-[200px] h-[4px] bg-gray-700 rounded-sm">
            <div
              className="h-full bg-appAccent rounded-sm transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <span className="text-[15px] text-textSecondary hidden md:block">
            {user.name}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User size={16} className="text-textSecondary" />
            )}
          </div>
        </div>
      </header>

      {/* Main Questionnaire Area */}
      <main className="flex items-center justify-center pt-[60px] md:pt-[100px] pb-[80px] px-6 md:px-[60px]">
        <div className="w-full max-w-[700px] min-h-[500px] bg-appSecondary rounded-3xl border border-gray-700 p-8 md:p-12">
          {/* Question Number */}
          <div className="text-appAccent text-base font-semibold mb-6">
            Question {currentQuestionIndex + 1}
          </div>

          {/* Question Text */}
          <h2 className="text-[24px] md:text-[28px] font-semibold text-textPrimary leading-[1.3] mb-8 md:mb-10">
            {currentQuestion.text}
          </h2>

          {/* Answer Input Area */}
          <div className="mb-8 md:mb-12">
            {currentQuestion.type === "text" && (
              <>
                <textarea
                  ref={textareaRef}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-full min-h-[120px] bg-appPrimary border-2 border-gray-700 rounded-xl p-5 text-base text-textPrimary focus:outline-none focus:border-appAccent transition-colors duration-200 resize-none"
                  placeholder="Share your thoughts..."
                  maxLength={maxLength}
                />

                {/* Character Counter */}
                <div className="flex justify-end mt-2">
                  <span
                    className={`text-xs transition-colors duration-200 ${
                      characterCount >= 450
                        ? "text-red-500"
                        : "text-textTertiary"
                    }`}
                  >
                    {characterCount}/{maxLength}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 md:mt-12 gap-4">
            <button
              onClick={handleBack}
              disabled={currentQuestionIndex === 0 || isNavigating}
              className={`px-4 md:px-6 py-3 border border-gray-700 rounded-lg text-base font-medium transition-colors duration-200 flex items-center gap-2 ${
                currentQuestionIndex === 0
                  ? "opacity-50 cursor-not-allowed text-textTertiary"
                  : "text-textSecondary hover:bg-gray-600 hover:text-textPrimary"
              }`}
            >
              {isNavigating && <Loader2 size={16} className="animate-spin" />}
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswerValid || isNavigating}
              className={`px-6 md:px-8 py-4 rounded-lg text-base font-semibold transition-colors duration-200 flex items-center gap-2 ${
                isAnswerValid && !isNavigating
                  ? "bg-appAccent text-white hover:bg-opacity-90"
                  : "bg-gray-700 text-textTertiary cursor-not-allowed"
              }`}
            >
              {isNavigating && <Loader2 size={16} className="animate-spin" />}
              {isNavigating
                ? "Loading..."
                : isLastQuestion
                ? "Get My Recommendations"
                : "Next"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionnairePage;
