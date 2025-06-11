
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, Film, Book } from 'lucide-react';

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

interface RecommendationCardProps {
  recommendation: Recommendation;
  onToggleFavorite?: (id: string) => void;
  onViewDetails?: (recommendation: Recommendation) => void;
}

const RecommendationCard = ({ 
  recommendation, 
  onToggleFavorite, 
  onViewDetails 
}: RecommendationCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="flex">
        <div className="w-32 flex-shrink-0">
          {recommendation.posterUrl ? (
            <img
              src={recommendation.posterUrl}
              alt={recommendation.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              {recommendation.type === 'movie' ? (
                <Film className="w-8 h-8 text-gray-400" />
              ) : (
                <Book className="w-8 h-8 text-gray-400" />
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg leading-tight mb-1">
                  {recommendation.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {recommendation.type === 'movie' 
                    ? `Directed by ${recommendation.director || 'Unknown'}`
                    : `By ${recommendation.author || 'Unknown Author'}`
                  }
                  {recommendation.year && ` • ${recommendation.year}`}
                </CardDescription>
              </div>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(recommendation.id)}
                  className="p-1 h-8 w-8"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      recommendation.isFavorite 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {recommendation.genre}
              </Badge>
              {recommendation.rating && (
                <Badge variant="outline" className="text-xs">
                  {recommendation.rating}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {recommendation.description}
            </p>
            
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-blue-900 font-medium mb-1">
                Why we recommend this:
              </p>
              <p className="text-sm text-blue-800">
                {recommendation.explanation}
              </p>
            </div>
            
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(recommendation)}
                className="w-full"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View Details
              </Button>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default RecommendationCard;
