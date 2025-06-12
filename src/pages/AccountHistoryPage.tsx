import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, X, Heart, ChevronDown } from "lucide-react";

interface HistoryRecommendation {
  id: string;
  type: "movie" | "book";
  title: string;
  director?: string;
  author?: string;
  dateAdded: string;
  poster: string;
  isFavorited: boolean;
}

type FilterType = "all" | "favorites" | "movies" | "books" | "month";
type SortType =
  | "newest"
  | "oldest"
  | "favorites"
  | "movies-only"
  | "books-only";

const AccountHistoryPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [showSettings, setShowSettings] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<
    string | null
  >(null);
  const [recommendations, setRecommendations] = useState<
    HistoryRecommendation[]
  >([]);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Mock user data
  const user = {
    name: "John Doe",
    initials: "JD",
    memberSince: "January 2025",
    stats: {
      total: 24,
      favorites: 8,
      thisMonth: 3,
    },
  };

  // Mock recommendations data
  const mockRecommendations: HistoryRecommendation[] = [
    {
      id: "rec-1",
      type: "movie",
      title: "Dune",
      director: "Denis Villeneuve",
      dateAdded: "Jan 15, 2025",
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/8b13813f4a-c976a8c740d2faf5aaa9.png",
      isFavorited: true,
    },
    {
      id: "rec-2",
      type: "book",
      title: "Project Hail Mary",
      author: "Andy Weir",
      dateAdded: "Jan 10, 2025",
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/083f4a4851-f841f78531dacc962c13.png",
      isFavorited: false,
    },
    {
      id: "rec-3",
      type: "movie",
      title: "Oppenheimer",
      director: "Christopher Nolan",
      dateAdded: "Dec 28, 2024",
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/48d2146589-0c1723c334df4ea89005.png",
      isFavorited: true,
    },
    {
      id: "rec-4",
      type: "book",
      title: "The Three-Body Problem",
      author: "Liu Cixin",
      dateAdded: "Dec 20, 2024",
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/4ba2995827-8267874c6e8c0843f186.png",
      isFavorited: false,
    },
    {
      id: "rec-5",
      type: "movie",
      title: "Everything Everywhere All at Once",
      director: "Daniels",
      dateAdded: "Dec 15, 2024",
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/7a2be7a305-46282ff0ba70409e32d1.png",
      isFavorited: true,
    },
    {
      id: "rec-6",
      type: "book",
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      dateAdded: "Dec 10, 2024",
      poster:
        "https://storage.googleapis.com/uxpilot-auth.appspot.com/c206b11eaf-ee331e6f35b892829ae1.png",
      isFavorited: false,
    },
  ];

  useEffect(() => {
    setRecommendations(mockRecommendations);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleContextMenu = (e: React.MouseEvent, recommendationId: string) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.pageX, y: e.pageY });
    setSelectedRecommendation(recommendationId);
    setShowContextMenu(true);
  };

  const handleContextMenuAction = (action: string) => {
    if (!selectedRecommendation) return;

    switch (action) {
      case "toggle-favorite":
        setRecommendations((prev) =>
          prev.map((rec) =>
            rec.id === selectedRecommendation
              ? { ...rec, isFavorited: !rec.isFavorited }
              : rec
          )
        );
        break;
      case "remove":
        setRecommendations((prev) =>
          prev.filter((rec) => rec.id !== selectedRecommendation)
        );
        break;
      case "view-details":
        // Navigate to recommendation details
        console.log("View details for:", selectedRecommendation);
        break;
      case "get-similar":
        // Navigate to get similar recommendations
        navigate("/content-selection");
        break;
    }
    setShowContextMenu(false);
    setSelectedRecommendation(null);
  };

  const getFilteredRecommendations = () => {
    let filtered = [...recommendations];

    // Apply filter
    switch (activeFilter) {
      case "favorites":
        filtered = filtered.filter((rec) => rec.isFavorited);
        break;
      case "movies":
        filtered = filtered.filter((rec) => rec.type === "movie");
        break;
      case "books":
        filtered = filtered.filter((rec) => rec.type === "book");
        break;
      case "month":
        // Filter for this month (simplified - just January 2025)
        filtered = filtered.filter((rec) => rec.dateAdded.includes("Jan"));
        break;
    }

    // Apply sort
    switch (sortBy) {
      case "oldest":
        filtered.reverse();
        break;
      case "favorites":
        filtered.sort(
          (a, b) => (b.isFavorited ? 1 : 0) - (a.isFavorited ? 1 : 0)
        );
        break;
      case "movies-only":
        filtered = filtered.filter((rec) => rec.type === "movie");
        break;
      case "books-only":
        filtered = filtered.filter((rec) => rec.type === "book");
        break;
    }

    return filtered;
  };

  const filteredRecommendations = getFilteredRecommendations();

  const getFilterTitle = () => {
    switch (activeFilter) {
      case "favorites":
        return "Favorites";
      case "movies":
        return "Movies";
      case "books":
        return "Books";
      case "month":
        return "This Month";
      default:
        return "All Recommendations";
    }
  };

  const RecommendationCard = ({
    recommendation,
  }: {
    recommendation: HistoryRecommendation;
  }) => (
    <div
      onContextMenu={(e) => handleContextMenu(e, recommendation.id)}
      className="bg-gray-600 rounded-xl border border-gray-700 overflow-hidden hover:bg-gray-500 hover:scale-[1.02] transition-all cursor-pointer"
    >
      <div className="relative h-[200px]">
        <img
          className="w-full h-full object-cover"
          src={recommendation.poster}
          alt={`${recommendation.title} ${
            recommendation.type === "movie" ? "poster" : "cover"
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#374151"/>
                <text x="50%" y="50%" font-family="Arial" font-size="48" fill="#9CA3AF" text-anchor="middle" dominant-baseline="middle">
                  ${recommendation.type === "movie" ? "🎬" : "📚"}
                </text>
              </svg>
            `)}`;
          }}
        />
        {recommendation.isFavorited && (
          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Heart size={12} className="fill-white text-white" />
          </div>
        )}
      </div>
      <div className="p-4 relative">
        <span
          className={`absolute top-4 left-4 text-white text-[10px] font-semibold uppercase py-1 px-2 rounded ${
            recommendation.type === "movie" ? "bg-appAccent" : "bg-emerald-500"
          }`}
        >
          {recommendation.type}
        </span>
        <h3 className="text-base font-semibold text-textPrimary mt-6 truncate">
          {recommendation.title}
        </h3>
        <p className="text-sm text-textSecondary mb-2">
          {recommendation.type === "movie"
            ? `Directed by ${recommendation.director}`
            : `by ${recommendation.author}`}
        </p>
        <p className="text-xs text-textTertiary">
          Added {recommendation.dateAdded}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-appPrimary text-textPrimary font-inter min-h-screen">
      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-6 md:px-12 bg-appPrimary border-b border-gray-700/30">
        <button
          onClick={handleLogoClick}
          className="text-textPrimary text-xl font-medium cursor-pointer hover:opacity-80 transition-opacity duration-200"
        >
          Smart Advisor
        </button>
        <div className="text-center">
          <span className="text-textSecondary text-base font-medium">
            My Recommendations
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettings(true)}
            className="text-textSecondary hover:text-textPrimary transition-colors duration-200"
          >
            <Settings size={18} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer">
            <span className="text-textPrimary text-sm">{user.name}</span>
            <div className="h-8 w-8 rounded-full bg-appAccent flex items-center justify-center text-white text-sm font-semibold">
              {user.initials}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex max-w-[1200px] mx-auto pt-6 md:pt-10 px-6 md:px-[60px] gap-8 md:gap-12 flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] lg:shrink-0">
          <div className="bg-appSecondary rounded-2xl border border-gray-700 p-6 md:p-8">
            {/* User Profile Section */}
            <div className="mb-8">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-appAccent flex items-center justify-center text-white text-2xl font-semibold mb-3">
                  {user.initials}
                </div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  {user.name}
                </h3>
                <p className="text-sm text-textTertiary">
                  Member since {user.memberSince}
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-8">
              <h4 className="text-base font-semibold text-textPrimary mb-4">
                Your Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary text-sm">
                    Total Recommendations
                  </span>
                  <span className="text-textPrimary text-sm font-medium">
                    {user.stats.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary text-sm">Favorites</span>
                  <span className="text-emerald-500 text-sm font-medium">
                    {user.stats.favorites}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary text-sm">This Month</span>
                  <span className="text-textPrimary text-sm font-medium">
                    {user.stats.thisMonth}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Navigation */}
            <div>
              <h4 className="text-base font-semibold text-textPrimary mb-4">
                Filter
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { key: "all" as FilterType, label: "All Recommendations" },
                  { key: "favorites" as FilterType, label: "Favorites Only" },
                  { key: "movies" as FilterType, label: "Movies" },
                  { key: "books" as FilterType, label: "Books" },
                  { key: "month" as FilterType, label: "This Month" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`text-left text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 ${
                      activeFilter === filter.key
                        ? "text-white bg-appAccent"
                        : "text-textSecondary hover:bg-gray-600"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-grow">
          {/* Content Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary">
              {getFilterTitle()}{" "}
              <span className="text-lg font-normal text-textTertiary">
                ({filteredRecommendations.length} items)
              </span>
            </h2>
          </div>

          {/* Sort Controls */}
          <div className="flex justify-end mb-6 md:mb-10">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="appearance-none bg-appSecondary border border-gray-700 rounded-md py-2 px-3 pr-8 text-sm text-textSecondary focus:outline-none focus:border-gray-600 cursor-pointer"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="favorites">Sort by: Favorites First</option>
                <option value="movies-only">Sort by: Movies Only</option>
                <option value="books-only">Sort by: Books Only</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-textSecondary">
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Recommendations Grid */}
          {filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">📚🎬</div>
              <h3 className="text-xl font-semibold text-textPrimary mb-2">
                No recommendations found
              </h3>
              <p className="text-textSecondary mb-6">
                Try a different filter or get new recommendations
              </p>
              <button
                onClick={() => navigate("/content-selection")}
                className="bg-appAccent text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
              >
                Get New Recommendation
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-appSecondary rounded-2xl border border-gray-700 p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-textPrimary">
                Account Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-textSecondary hover:text-textPrimary transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-textSecondary text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full bg-appPrimary border border-gray-700 text-textPrimary text-base font-normal rounded-lg p-3 focus:outline-none focus:border-appAccent transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-textSecondary text-sm font-medium mb-2">
                  Age
                </label>
                <input
                  type="number"
                  defaultValue="32"
                  className="w-[120px] bg-appPrimary border border-gray-700 text-textPrimary text-base font-normal rounded-lg p-3 focus:outline-none focus:border-appAccent transition-colors duration-200"
                />
              </div>
              <button className="w-full bg-appAccent text-white text-base font-semibold rounded-lg py-3 mt-4 hover:bg-opacity-90 transition-colors duration-200">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-appSecondary border border-gray-700 rounded-lg shadow-lg py-2 w-48 z-40"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <button
            onClick={() => handleContextMenuAction("view-details")}
            className="w-full text-left px-4 py-2 text-textSecondary hover:bg-gray-600 text-sm transition-colors duration-200"
          >
            View Details
          </button>
          <button
            onClick={() => handleContextMenuAction("toggle-favorite")}
            className="w-full text-left px-4 py-2 text-textSecondary hover:bg-gray-600 text-sm transition-colors duration-200"
          >
            Toggle Favorite
          </button>
          <button
            onClick={() => handleContextMenuAction("remove")}
            className="w-full text-left px-4 py-2 text-textSecondary hover:bg-gray-600 text-sm transition-colors duration-200"
          >
            Remove from History
          </button>
          <button
            onClick={() => handleContextMenuAction("get-similar")}
            className="w-full text-left px-4 py-2 text-textSecondary hover:bg-gray-600 text-sm transition-colors duration-200"
          >
            Get Similar
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountHistoryPage;
