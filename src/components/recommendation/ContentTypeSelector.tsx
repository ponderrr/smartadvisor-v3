
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Film, Book, Star } from 'lucide-react';

interface ContentTypeSelectorProps {
  onSelect: (type: 'movie' | 'book' | 'both') => void;
}

const ContentTypeSelector = ({ onSelect }: ContentTypeSelectorProps) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What would you like a recommendation for?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your preferred content type and we'll create a personalized questionnaire to find your perfect match.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-200"
            onClick={() => onSelect('movie')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Film className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Movies</CardTitle>
              <CardDescription>
                Discover your next favorite film based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">Get Movie Recommendation</Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-green-200"
            onClick={() => onSelect('book')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Book className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Books</CardTitle>
              <CardDescription>
                Find the perfect book that matches your reading taste
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">Get Book Recommendation</Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-purple-200"
            onClick={() => onSelect('both')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Both</CardTitle>
              <CardDescription>
                Get recommendations for both a movie and a book
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">Get Both Recommendations</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContentTypeSelector;
