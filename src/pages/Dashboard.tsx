
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, History, User } from 'lucide-react';

interface DashboardProps {
  user: {
    name: string;
    email: string;
  };
  onStartRecommendation: () => void;
  onViewHistory: () => void;
}

const Dashboard = ({ user, onStartRecommendation, onViewHistory }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to discover your next favorite movie or book? Let our AI-powered recommendations guide you to something amazing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-200"
            onClick={onStartRecommendation}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">New Recommendation</CardTitle>
              <CardDescription>
                Start a personalized questionnaire to get AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" size="lg">
                Get Started
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-green-200"
            onClick={onViewHistory}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">My History</CardTitle>
              <CardDescription>
                View and manage your past recommendations and favorites
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full" size="lg">
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
