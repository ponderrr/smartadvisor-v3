import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Loader2, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { generateQuestionsWithRetry } from "@/services/openai";
import { Question } from "@/types/Question";
import { Answer } from "@/types/Answer";
import { v4 as uuidv4 } from "uuid";

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const contentType = location.state?.contentType as "movie" | "book" | "both";

  useEffect(() => {
    if (!contentType || !user) {
      navigate("/content-selection");
      return;
    }

    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const generatedQuestions = await generateQuestionsWithRetry(
          contentType,
          user.age
        );

        setQuestions(generatedQuestions);
      } catch (err) {
        setError("Failed to generate questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [contentType, user, navigate]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      navigate("/content-selection");
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);

    const formattedAnswers: Answer[] = questions.map((q) => ({
      id: uuidv4(),
      question_id: q.id,
      answer_text: answers[q.id] || "",
      user_id: user.id,
      created_at: new Date().toISOString(),
    }));

    navigate("/results", {
      state: {
        answers: formattedAnswers,
        contentType,
        userAge: user.age,
      },
    });
  };

  const canProceed =
    currentQuestion && answers[currentQuestion.id]?.trim().length > 0;

  if (isLoading) {
    return (
      <div className="bg-appPrimary text-textPrimary font-inter min-h-screen">
        <header className="h-[72px] flex items-center justify-between px-6 md:px-12">
          <button
            onClick={handleLogoClick}
            className="text-textPrimary text-xl font-medium"
          >
            Smart Advisor
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
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

        <main className="flex flex-col items-center justify-center px-6 pt-[120px]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-appAccent mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-textPrimary mb-2">
              Generating Your Questions...
            </h2>
            <p className="text-textSecondary">
              Our AI is creating personalized questions just for you.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-appPrimary text-textPrimary font-inter min-h-screen">
        <header className="h-[72px] flex items-center justify-between px-6 md:px-12">
          <button
            onClick={handleLogoClick}
            className="text-textPrimary text-xl font-medium"
          >
            Smart Advisor
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
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

        <main className="flex flex-col items-center justify-center px-6 pt-[120px]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold text-textPrimary mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-textSecondary mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-appAccent hover:bg-opacity-90"
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-appPrimary text-textPrimary font-inter min-h-screen">
      <header className="h-[72px] flex items-center justify-between px-6 md:px-12">
        <button
          onClick={handleLogoClick}
          className="text-textPrimary text-xl font-medium"
        >
          Smart Advisor
        </button>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2"
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

      <main className="px-6 pt-[80px] md:pt-[120px] pb-[100px]">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-textPrimary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h1>
              <span className="text-sm text-textSecondary capitalize">
                {contentType} recommendation
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="mb-8 bg-appSecondary border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-textPrimary">
                {currentQuestion.text}
              </CardTitle>
              <CardDescription className="text-textSecondary">
                Take your time to think about your answer. The more details you
                provide, the better we can tailor our recommendation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-32 resize-none bg-appPrimary border-gray-600 text-textPrimary"
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center space-x-2 border-gray-600 text-textSecondary hover:text-textPrimary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex items-center space-x-2 bg-appAccent hover:bg-opacity-90"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {currentQuestionIndex === questions.length - 1
                      ? "Get Recommendations"
                      : "Next"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionnairePage;
