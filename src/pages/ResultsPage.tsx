import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RefreshCw, Heart, User, LogOut, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { enhancedRecommendationsService } from "@/services/enhancedRecommendations";
import { databaseService } from "@/services/database";
import { Recommendation } from "@/types/Recommendation";
import {
  EnhancedButton,
  LoadingScreen,
  RecommendationLoadingShimmer,
} from "@/components/enhanced";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>(
    "Analyzing your answers..."
  );

  // Get data from navigation state
  const { contentType, answers, questions } = location.state || {};

  useEffect(() => {
    // Redirect if no data
    if (!contentType || !answers || !user) {
      navigate("/content-selection");
      return;
    }

    // Generate recommendations
    loadRecommendations();
  }, [contentType, answers, user, navigate]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Starting AI recommendation generation for user:", user.id);

      // Update generation steps for better UX
      setGenerationStep("Analyzing your answers...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setGenerationStep("Generating personalized recommendations...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setGenerationStep("Enhancing with movie and book data...");

      const questionnaireData = {
        answers,
        contentType,
        userAge: user.age,
      };

      const recs = await enhancedRecommendationsService.retryRecommendation(
        questionnaireData,
        user.id
      );

      setGenerationStep("Finalizing your recommendations...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Recommendations generated successfully:", recs);
      setRecommendations(recs);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setError(
        "Failed to generate personalized recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGetAnother = () => {
    navigate("/content-selection");
  };

  const handleViewHistory = () => {
    navigate("/history");
  };

  const handleToggleFavorite = async (recommendationId: string) => {
    try {
      const { error } = await databaseService.toggleFavorite(recommendationId);
      if (!error) {
        // Update local state
        setRecommendations((recs) =>
          recs.map((rec) =>
            rec.id === recommendationId
              ? { ...rec, is_favorited: !rec.is_favorited }
              : rec
          )
        );
      } else {
        console.error("Error toggling favorite:", error);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleRetry = () => {
    loadRecommendations();
  };

  if (!contentType || !answers || !user) {
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-appAccent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-textSecondary text-[15px]">
              Hi, {user?.name}
            </span>
          </div>
        </header>

        <LoadingScreen
          message="Creating Your Recommendations"
          submessage={generationStep}
        />
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-appAccent rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-textSecondary text-[15px]">
              Hi, {user?.name}
            </span>
          </div>
        </header>

        {/* Error Content */}
        <main className="flex flex-col items-center justify-center px-6 pt-[120px] pb-[100px]">
          <div className="text-center max-w-md animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-white text-2xl">!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Recommendation Generation Failed
            </h1>
            <p className="text-lg text-textSecondary mb-8">{error}</p>
            <div className="flex gap-4 justify-center">
              <EnhancedButton onClick={handleRetry} variant="primary" glow>
                <RefreshCw size={16} />
                Try Again
              </EnhancedButton>
              <EnhancedButton
                onClick={() =>
                  navigate("/questionnaire", { state: { contentType } })
                }
                variant="secondary"
              >
                Retake Quiz
              </EnhancedButton>
            </div>
          </div>
        </main>
      </div>
    );
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
            <div className="user-menu absolute right-0 top-full mt-2 w-48 bg-appSecondary border border-gray-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => navigate("/history")}
                className="user-menu-item w-full flex items-center gap-2 px-4 py-3 text-textSecondary hover:text-textPrimary hover:bg-gray-700 transition-colors duration-200"
              >
                <User size={16} />
                View History
              </button>
              <button
                onClick={handleSignOut}
                className="user-menu-item w-full flex items-center gap-2 px-4 py-3 text-textSecondary hover:text-textPrimary hover:bg-gray-700 transition-colors duration-200 border-t border-gray-700"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-[80px] md:pt-[120px] pb-[100px]">
        {/* Progress Indicator */}
        <div className="text-center text-textTertiary text-sm mb-8 animate-in fade-in duration-500">
          Step 3 of 3
        </div>

        {/* Title */}
        <div className="text-center mb-12 animate-in fade-in duration-700 delay-200">
          <h1 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4">
            Your AI-Generated Recommendations
          </h1>
          <p className="text-lg text-textSecondary">
            Based on your personalized answers, here's what our AI recommends
          </p>
        </div>

        {/* Recommendations */}
        <div className="max-w-4xl mx-auto space-y-8">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="recommendation-card bg-appSecondary border border-gray-700 rounded-2xl p-8 flex flex-col md:flex-row gap-6"
              style={{ animationDelay: `${400 + index * 200}ms` }}
            >
              {/* Poster/Cover */}
              <div className="w-full md:w-48 h-72 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                {rec.poster_url ? (
                  <img
                    src={rec.poster_url}
                    alt={rec.title}
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-textTertiary ${
                    rec.poster_url ? "hidden" : ""
                  }`}
                >
                  No Image
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-textPrimary mb-2">
                      {rec.title}
                    </h2>
                    {rec.director && (
                      <p className="text-textSecondary">
                        Directed by {rec.director}
                      </p>
                    )}
                    {rec.author && (
                      <p className="text-textSecondary">By {rec.author}</p>
                    )}
                    {rec.year && (
                      <p className="text-textSecondary">{rec.year}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(rec.id)}
                    className={`favorite-button p-2 rounded-full transition-colors duration-200 ${
                      rec.is_favorited
                        ? "bg-red-500 text-white favorited"
                        : "bg-gray-700 text-textSecondary hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={rec.is_favorited ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Rating */}
                {rec.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-textPrimary font-medium">
                      {rec.rating}
                    </span>
                  </div>
                )}

                {/* Genres */}
                {rec.genres && rec.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.genres.map((g, genreIndex) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-appAccent text-white text-sm rounded-full animate-in fade-in duration-500"
                        style={{
                          animationDelay: `${
                            800 + index * 200 + genreIndex * 100
                          }ms`,
                        }}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Explanation */}
                {rec.description && (
                  <div
                    className="bg-appPrimary border border-gray-600 rounded-lg p-4 animate-in fade-in duration-700"
                    style={{ animationDelay: `${1000 + index * 200}ms` }}
                  >
                    <h3 className="text-textPrimary font-semibold mb-2">
                      {rec.type === "movie"
                        ? "Plot Summary:"
                        : "Book Description:"}
                    </h3>
                    <p className="text-textSecondary">{rec.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-in fade-in duration-700 delay-1000">
          <EnhancedButton
            onClick={handleGetAnother}
            variant="primary"
            size="lg"
            glow
          >
            Get Another Recommendation
          </EnhancedButton>
          <EnhancedButton
            onClick={handleViewHistory}
            variant="secondary"
            size="lg"
          >
            View My History
          </EnhancedButton>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
