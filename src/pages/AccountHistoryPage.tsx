import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Heart, Star, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserRecommendations,
  toggleFavorite,
} from "@/services/recommendations";
import { Recommendation } from "@/types/Recommendation";

const AccountHistoryPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "movies" | "books" | "favorites"
  >("all");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const { data, error } = await getUserRecommendations();
        if (error) {
          console.error("Error loading recommendations:", error);
        } else {
          setRecommendations(data);
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleGetNewRecommendation = () => {
    navigate("/content-selection");
  };

  const handleToggleFavorite = async (recommendationId: string) => {
    try {
      const { error } = await toggleFavorite(recommendationId);
      if (!error) {
        // Update local state
        setRecommendations((recs) =>
          recs.map((rec) =>
            rec.id === recommendationId
              ? { ...rec, is_favorited: !rec.is_favorited }
              : rec
          )
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    switch (filter) {
      case "movies":
        return rec.type === "movie";
      case "books":
        return rec.type === "book";
      case "favorites":
        return rec.is_favorited;
      default:
        return true;
    }
  });

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
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 text-textSecondary hover:text-textPrimary hover:bg-gray-700 transition-colors duration-200"
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
        {/* Title and New Recommendation Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-textPrimary mb-2">
              My Recommendations
            </h1>
            <p className="text-lg text-textSecondary">
              Your personalized collection of books and movies
            </p>
          </div>
          <button
            onClick={handleGetNewRecommendation}
            className="flex items-center gap-2 bg-appAccent text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200"
          >
            <Plus size={20} />
            Get New Recommendation
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "movies", label: "Movies" },
            { key: "books", label: "Books" },
            { key: "favorites", label: "Favorites" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                filter === key
                  ? "bg-appAccent text-white"
                  : "bg-appSecondary text-textSecondary hover:text-textPrimary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-textSecondary">
              Loading your recommendations...
            </div>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-20">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-textTertiary" />
              </div>
              <h2 className="text-xl font-semibold text-textPrimary mb-2">
                {filter === "favorites"
                  ? "No favorites yet"
                  : "No recommendations yet"}
              </h2>
              <p className="text-textSecondary mb-6">
                {filter === "favorites"
                  ? "Start favoriting recommendations to see them here"
                  : "Get your first personalized recommendation to begin building your library"}
              </p>
            </div>
            <button
              onClick={handleGetNewRecommendation}
              className="bg-appAccent text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200"
            >
              Get Your First Recommendation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-appSecondary border border-gray-700 rounded-xl p-6 hover:border-appAccent transition-all duration-200"
              >
                {/* Poster/Cover */}
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4">
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-textPrimary mb-1 line-clamp-2">
                      {rec.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          rec.type === "movie"
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {rec.type}
                      </span>
                      {rec.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-textSecondary">
                            {rec.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(rec.id)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      rec.is_favorited
                        ? "bg-red-500 text-white"
                        : "bg-gray-700 text-textSecondary hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={rec.is_favorited ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {/* Genres */}
                {rec.genres && rec.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {rec.genres.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-1 bg-gray-700 text-textSecondary text-xs rounded"
                      >
                        {g}
                      </span>
                    ))}
                    {rec.genres.length > 2 && (
                      <span className="px-2 py-1 bg-gray-700 text-textSecondary text-xs rounded">
                        +{rec.genres.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Date */}
                <div className="text-xs text-textTertiary">
                  Added {new Date(rec.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AccountHistoryPage;
