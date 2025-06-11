
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import RecommendationCard from './RecommendationCard';

interface Recommendation {
  id: string;
  type: 'movie' | 'book';
  title: string;
  description: string;
  explanation: string;
  genre: string;
  rating?: string;
  year?: string;
  author?: string;
  director?: string;
  posterUrl?: string;
  isFavorite?: boolean;
}

interface RecommendationResultsProps {
  recommendations: Recommendation[];
  contentType: 'movie' | 'book' | 'both';
  onBack: () => void;
  onNewRecommendation: () => void;
  onToggleFavorite?: (id: string) => void;
  isLoading?: boolean;
}

const RecommendationResults = ({
  recommendations,
  contentType,
  onBack,
  onNewRecommendation,
  onToggleFavorite,
  isLoading
}: RecommendationResultsProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Generating Your Recommendations...
          </h2>
          <p className="text-gray-600">
            Our AI is analyzing your preferences to find the perfect match.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Personalized Recommendations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your preferences, here's what we think you'll love:
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Questions</span>
          </Button>

          <Button
            onClick={onNewRecommendation}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Get Another Recommendation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationResults;
