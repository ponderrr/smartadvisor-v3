import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart, Check, Star, Loader2, AlertTriangle } from "lucide-react";

interface Answer {
  questionId: number;
  answer: string;
}

interface ResultsState {
  contentType: "movie" | "book" | "both";
  answers: Answer[];
}

interface Recommendation {
  id: string;
  type: "movie" | "book";
  title: string;
  director?: string;
  author?: string;
  year: number;
  rating: number;
  genres: string[];
  poster: string;
  isFavorited: boolean;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from questionnaire
  const state = location.state as ResultsState;
  const contentType = state?.contentType || "both";
  const answers = state?.answers || [];

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cardAnimations, setCardAnimations] = useState({
    movie: false,
    book: false,
  });

  // Mock user data
  const user = {
    name: "Alex Smith",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
  };

  // Mock recommendations - in real app, these would come from AI API
  const mockRecommendations: Recommendation[] = [
    {
      id: "movie-1",
      type: "movie",
      title: "Interstellar Horizon",
      director: "Christopher Nolan",
      year: 2023,
      rating: 8.7,
      genres: ["Sci-Fi", "Drama", "Adventure"],
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/d22e56b245-b74c36f12f36849ab173.png",
      isFavorited: false,
    },
    {
      id: "book-1",
      type: "book",
      title: "The Midnight Chronicles",
      author: "Sarah J. Maas",
      year: 2024,
      rating: 9.2,
      genres: ["Fantasy", "Mystery", "Young Adult"],
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/f229480852-c71b4d2c958606108426.png",
      isFavorited: false,
    },
  ];

  useEffect(() => {
    // Simulate API call to generate recommendations
    const generateRecommendations = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Filter recommendations based on content type
        let filteredRecommendations = mockRecommendations;
        if (contentType === "movie") {
          filteredRecommendations = mockRecommendations.filter(
            (r) => r.type === "movie"
          );
        } else if (contentType === "book") {
          filteredRecommendations = mockRecommendations.filter(
            (r) => r.type === "book"
          );
        }

        setRecommendations(filteredRecommendations);
        setIsLoading(false);

        // Trigger card animations with stagger
        setTimeout(() => {
          setCardAnimations((prev) => ({ ...prev, movie: true }));
          setTimeout(() => {
            setCardAnimations((prev) => ({ ...prev, book: true }));
          }, 100);
        }, 300);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setError(true);
        setIsLoading(false);
      }
    };

    generateRecommendations();
  }, [contentType, answers]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleUserMenuClick = () => {
    navigate("/history");
  };

  const handleFavorite = (recommendationId: string) => {
    setRecommendations((prev) =>
      prev.map((rec) =>
        rec.id === recommendationId
          ? { ...rec, isFavorited: !rec.isFavorited }
          : rec
      )
    );
  };

  const handleGetAnotherRecommendation = () => {
    navigate("/content-selection");
  };

  const handleViewHistory = () => {
    navigate("/history");
  };

  const handleRetryQuestionnaire = () => {
    navigate("/questionnaire", { state: { contentType } });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {/* Full stars */}
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star
              key={`full-${i}`}
              size={14}
              className="fill-amber-500 text-amber-500"
            />
          ))}
        {/* Half star */}
        {hasHalfStar && (
          <Star
            key="half"
            size={14}
            className="fill-amber-500 text-amber-500"
          />
        )}
        {/* Empty stars */}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} size={14} className="text-gray-500" />
          ))}
        <span className="text-textSecondary ml-1 text-sm">{rating}/10</span>
      </div>
    );
  };

  const RecommendationCard = ({
    recommendation,
  }: {
    recommendation: Recommendation;
  }) => {
    const isMovie = recommendation.type === "movie";
    const shouldAnimate = isMovie ? cardAnimations.movie : cardAnimations.book;

    return (
      <div
        className={`w-full md:w-[480px] bg-appSecondary rounded-[20px] border border-gray-700 overflow-hidden transition-all duration-500 hover:shadow-lg hover:scale-[1.02] ${
          shouldAnimate
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-5"
        }`}
      >
        {/* Cover/Poster */}
        <div
          className={`w-full bg-gray-600 rounded-t-[20px] overflow-hidden ${
            isMovie ? "h-[320px]" : "h-[400px]"
          }`}
        >
          <img
            className="w-full h-full object-cover"
            src={recommendation.poster}
            alt={`${recommendation.title} ${isMovie ? "poster" : "cover"}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#374151"/>
                  <text x="50%" y="50%" font-family="Arial" font-size="48" fill="#9CA3AF" text-anchor="middle" dominant-baseline="middle">
                    ${isMovie ? "🎬" : "📚"}
                  </text>
                </svg>
              `)}`;
            }}
          />
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-textPrimary mb-2 line-clamp-2">
            {recommendation.title}
          </h2>

          {/* Metadata Row */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            <p className="text-sm text-textSecondary">
              {isMovie
                ? `directed by ${recommendation.director}`
                : `by ${recommendation.author}`}
            </p>
            <p className="text-sm text-textSecondary">{recommendation.year}</p>
            {renderStars(recommendation.rating)}
          </div>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {recommendation.genres.map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-gray-700 text-textSecondary text-xs font-medium rounded"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleFavorite(recommendation.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                recommendation.isFavorited
                  ? "bg-gray-700 text-textPrimary"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              {recommendation.isFavorited ? (
                <>
                  <Check size={16} />
                  <span>Favorited!</span>
                </>
              ) : (
                <>
                  <Heart size={16} />
                  <span>Mark as Favorite</span>
                </>
              )}
            </button>
            <button className="flex-1 border border-gray-700 text-textSecondary py-3 px-5 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors duration-200">
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-appPrimary bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin text-appAccent mb-4 mx-auto"
          />
          <p className="text-xl text-textPrimary">
            Generating your recommendations...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="fixed inset-0 bg-appPrimary bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center max-w-md px-6">
          <AlertTriangle size={48} className="text-red-500 mb-4 mx-auto" />
          <p className="text-xl text-red-500 mb-6">
            Unable to generate recommendations. Let's try again.
          </p>
          <button
            onClick={handleRetryQuestionnaire}
            className="bg-appAccent text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
          >
            Retry Questionnaire
          </button>
        </div>
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
        <div className="flex items-center space-x-6">
          <span className="text-textSecondary text-[15px] font-normal cursor-pointer hover:text-textPrimary transition-colors duration-200">
            Your Recommendations
          </span>
          <button
            onClick={handleUserMenuClick}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          >
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <span className="text-textPrimary text-sm">{user.name}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 md:pb-20 px-6 bg-appPrimary">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-[42px] font-bold text-textPrimary leading-tight mb-4">
            Here are your personalized recommendations!
          </h1>
          <p className="text-lg text-textSecondary mb-16">
            Curated just for you
          </p>
        </div>
      </section>

      {/* Recommendations Container */}
      <section className="px-6 mb-12 md:mb-20">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-center gap-8 md:gap-12">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))}
        </div>
      </section>

      {/* Bottom Action Section */}
      <section className="px-6 mb-20">
        <div className="max-w-[1200px] mx-auto border-t border-gray-700 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <button
              onClick={handleGetAnotherRecommendation}
              className="w-full md:w-auto bg-appAccent text-white font-semibold py-4 px-8 rounded-lg text-base transition-colors duration-200 hover:bg-opacity-90"
            >
              Get Another Recommendation
            </button>
            <button
              onClick={handleViewHistory}
              className="w-full md:w-auto border border-gray-700 text-textSecondary font-medium py-4 px-8 rounded-lg text-base transition-colors duration-200 hover:bg-gray-600"
            >
              View My History
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultsPage;
