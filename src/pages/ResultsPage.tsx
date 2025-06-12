import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RefreshCw, Heart, User, LogOut, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { generateMockRecommendations } from "@/services/recommendations";
import { Recommendation } from "@/types/Recommendation";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Get data from navigation state
  const { contentType, answers, questions } = location.state || {};

  useEffect(() => {
    // Redirect if no data
    if (!contentType || !answers) {
      navigate("/content-selection");
      return;
    }

    // Generate recommendations
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const recs = await generateMockRecommendations(contentType);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error generating recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [contentType, answers, navigate]);

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

  const toggleFavorite = (recommendationId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recommendationId)) {
      newFavorites.delete(recommendationId);
    } else {
      newFavorites.add(recommendationId);
    }
    setFavorites(newFavorites);
  };

  if (!contentType || !answers) {
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

        {/* Loading Content */}
        <main className="flex flex-col items-center justify-center px-6 pt-[120px] pb-[100px]">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-appAccent animate-spin mx-auto mb-8" />
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Generating Your Recommendations
            </h1>
            <p className="text-lg text-textSecondary">
              Our AI is analyzing your preferences to find the perfect{" "}
              {contentType} for you...
            </p>
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
      <main className="px-6 pt-[80px] md:pt-[120px] pb-[100px]">
        {/* Progress Indicator */}
        <div className="text-center text-textTertiary text-sm mb-8">
          Step 3 of 3
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4">
            Your Personalized Recommendations
          </h1>
          <p className="text-lg text-textSecondary">
            Based on your preferences, here's what we think you'll love
          </p>
        </div>

        {/* Recommendations */}
        <div className="max-w-4xl mx-auto space-y-8">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-appSecondary border border-gray-700 rounded-2xl p-8 flex flex-col md:flex-row gap-6"
            >
              {/* Poster/Cover */}
              <div className="w-full md:w-48 h-72 bg-gray-700 rounded-lg flex-shrink-0">
                {rec.poster_url ? (
                  <img
                    src={rec.poster_url}
                    alt={rec.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-textTertiary">
                    No Image
                  </div>
                )}
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
                    onClick={() => toggleFavorite(rec.id)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      favorites.has(rec.id)
                        ? "bg-red-500 text-white"
                        : "bg-gray-700 text-textSecondary hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={favorites.has(rec.id) ? "currentColor" : "none"}
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
                    {rec.genres.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-appAccent text-white text-sm rounded-full"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {rec.explanation && (
                  <p className="text-textSecondary mb-4">{rec.explanation}</p>
                )}

                {/* AI Explanation */}
                {rec.explanation && (
                  <div className="bg-appPrimary border border-gray-600 rounded-lg p-4">
                    <h3 className="text-textPrimary font-semibold mb-2">
                      Why we recommend this:
                    </h3>
                    <p className="text-textSecondary">{rec.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button
            onClick={handleGetAnother}
            className="bg-appAccent text-white px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200"
          >
            Get Another Recommendation
          </button>
          <button
            onClick={handleViewHistory}
            className="bg-appSecondary border border-gray-700 text-textPrimary px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            View My History
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
