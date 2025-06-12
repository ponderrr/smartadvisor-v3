import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Book, Target, Loader2 } from "lucide-react";

type ContentType = "movie" | "book" | "both" | null;

interface SelectionCardProps {
  id: ContentType;
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: (type: ContentType) => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  id,
  icon,
  title,
  description,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={`selection-card rounded-2xl p-10 h-[280px] flex flex-col items-center cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? "bg-indigo-900 border-appAccent"
          : "bg-appSecondary border-gray-700 hover:bg-gray-600 hover:border-appAccent"
      }`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-200 ${
          isSelected ? "bg-appAccent" : "bg-gray-700"
        }`}
      >
        <div
          className={`text-2xl transition-colors duration-200 ${
            isSelected ? "text-white" : "text-textSecondary"
          }`}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-textPrimary mb-4">{title}</h3>
      <p className="text-textSecondary text-center leading-relaxed text-[15px]">
        {description}
      </p>
    </div>
  );
};

const ContentSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ContentType>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data - replace with actual user context/state
  const user = {
    name: "Alex",
    avatar:
      "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg",
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleCardSelection = (type: ContentType) => {
    setSelectedType(type);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsLoading(true);

    try {
      // Simulate API call or processing time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to questionnaire page with selected type
      navigate("/questionnaire", {
        state: { contentType: selectedType },
      });
    } catch (error) {
      console.error("Error proceeding to questionnaire:", error);
      setIsLoading(false);
    }
  };

  const cards = [
    {
      id: "movie" as ContentType,
      icon: <Film size={32} />,
      title: "Movie",
      description:
        "Get a personalized movie recommendation based on your taste and preferences",
    },
    {
      id: "book" as ContentType,
      icon: <Book size={32} />,
      title: "Book",
      description:
        "Discover your next great read with AI-powered book suggestions tailored to you",
    },
    {
      id: "both" as ContentType,
      icon: <Target size={32} />,
      title: "Both",
      description:
        "Get recommendations for both a movie and a book to complete your entertainment",
    },
  ];

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
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={user.avatar}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML = user.name
                  .charAt(0)
                  .toUpperCase();
                target.parentElement!.className +=
                  " text-white text-sm font-medium";
              }}
            />
          </div>
          <span className="text-textSecondary text-[15px]">
            Hi, {user.name}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-6 pt-[80px] md:pt-[120px] pb-[100px]">
        {/* Progress Indicator */}
        <div className="text-textTertiary text-sm mb-8">Step 1 of 3</div>

        {/* Page Title Section */}
        <div className="max-w-[800px] text-center mb-12 md:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-textPrimary leading-tight mb-4">
            What would you like a recommendation for?
          </h1>
          <p className="text-lg text-textSecondary leading-relaxed">
            Choose one option to get started with your personalized
            questionnaire
          </p>
        </div>

        {/* Selection Cards Container */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-[800px] w-full mb-12 md:mb-16">
          {cards.map((card) => (
            <SelectionCard
              key={card.id}
              id={card.id}
              icon={card.icon}
              title={card.title}
              description={card.description}
              isSelected={selectedType === card.id}
              onClick={handleCardSelection}
            />
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          className={`font-semibold text-base py-4 px-12 rounded-lg transition-all duration-200 flex items-center gap-2 ${
            selectedType && !isLoading
              ? "bg-appAccent text-white hover:bg-opacity-90 cursor-pointer"
              : "bg-gray-700 text-textTertiary cursor-not-allowed"
          }`}
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? "Continue..." : "Continue"}
        </button>
      </main>
    </div>
  );
};

export default ContentSelectionPage;
