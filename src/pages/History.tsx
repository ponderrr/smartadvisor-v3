
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RecommendationCard from '@/components/recommendation/RecommendationCard';
import { recommendationService, type Recommendation } from '@/services/mockRecommendations';

interface HistoryProps {
  user: {
    id?: string;
    name: string;
    email: string;
  };
  onBack: () => void;
}

const History = ({ user, onBack }: HistoryProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await recommendationService.getUserRecommendations(user.id || '1');
        setRecommendations(history);
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user.id]);

  const handleToggleFavorite = async (recommendationId: string) => {
    try {
      await recommendationService.toggleFavorite(user.id || '1', recommendationId);
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, isFavorite: !rec.isFavorite }
            : rec
        )
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading Your History...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Recommendations</h1>
            <p className="text-gray-600">Your personalized recommendation history</p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No recommendations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get your first recommendation to start building your personalized library
            </p>
            <Button onClick={onBack}>
              Get Your First Recommendation
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
