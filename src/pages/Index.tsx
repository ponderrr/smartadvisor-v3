
import React, { useState, useEffect } from 'react';
import { authService, type User, type AuthData } from '@/services/mockAuth';
import { recommendationService, type Recommendation } from '@/services/mockRecommendations';
import { toast } from '@/hooks/use-toast';

// Components
import Header from '@/components/layout/Header';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from './Dashboard';
import ContentTypeSelector from '@/components/recommendation/ContentTypeSelector';
import QuestionnaireFlow from '@/components/recommendation/QuestionnaireFlow';
import RecommendationResults from '@/components/recommendation/RecommendationResults';
import History from './History';

type AppState = 'auth' | 'dashboard' | 'content-select' | 'questionnaire' | 'results' | 'history';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>('auth');
  const [contentType, setContentType] = useState<'movie' | 'book' | 'both'>('movie');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setAppState('dashboard');
    }
  }, []);

  const handleAuth = async (authData: AuthData) => {
    setIsLoading(true);
    try {
      const user = await authService.authenticate(authData);
      setUser(user);
      setAppState('dashboard');
      toast({
        title: "Welcome!",
        description: authData.isSignUp ? "Account created successfully" : "Logged in successfully",
      });
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    authService.signOut();
    setUser(null);
    setAppState('auth');
    setRecommendations([]);
    toast({
      title: "Signed out",
      description: "You've been successfully signed out",
    });
  };

  const handleStartRecommendation = () => {
    setAppState('content-select');
  };

  const handleContentTypeSelect = (type: 'movie' | 'book' | 'both') => {
    setContentType(type);
    setAppState('questionnaire');
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    if (!user) return;
    
    setIsLoading(true);
    setAppState('results');
    
    try {
      const recommendations = await recommendationService.generateRecommendations(
        contentType,
        answers,
        user.age
      );
      
      setRecommendations(recommendations);
      
      // Save recommendations to user's history
      for (const rec of recommendations) {
        await recommendationService.saveRecommendation(user.id, rec);
      }
      
      toast({
        title: "Recommendations ready!",
        description: `We found ${recommendations.length} perfect ${contentType === 'both' ? 'recommendations' : contentType} for you`,
      });
    } catch (error) {
      toast({
        title: "Failed to generate recommendations",
        description: "Please try again later",
        variant: "destructive",
      });
      setAppState('questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToQuestionnaire = () => {
    setAppState('questionnaire');
  };

  const handleNewRecommendation = () => {
    setAppState('content-select');
    setRecommendations([]);
  };

  const handleBackToDashboard = () => {
    setAppState('dashboard');
  };

  const handleViewHistory = () => {
    setAppState('history');
  };

  const handleToggleFavorite = async (recommendationId: string) => {
    if (!user) return;
    
    try {
      await recommendationService.toggleFavorite(user.id, recommendationId);
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, isFavorite: !rec.isFavorite }
            : rec
        )
      );
    } catch (error) {
      toast({
        title: "Failed to update favorite",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Render authentication form if user is not logged in
  if (!user) {
    return <AuthForm onAuth={handleAuth} isLoading={isLoading} />;
  }

  // Render main application
  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onSignOut={handleSignOut} />
      
      {appState === 'dashboard' && (
        <Dashboard
          user={user}
          onStartRecommendation={handleStartRecommendation}
          onViewHistory={handleViewHistory}
        />
      )}
      
      {appState === 'content-select' && (
        <ContentTypeSelector onSelect={handleContentTypeSelect} />
      )}
      
      {appState === 'questionnaire' && (
        <QuestionnaireFlow
          contentType={contentType}
          userAge={user.age}
          onComplete={handleQuestionnaireComplete}
          onBack={handleBackToDashboard}
        />
      )}
      
      {appState === 'results' && (
        <RecommendationResults
          recommendations={recommendations}
          contentType={contentType}
          onBack={handleBackToQuestionnaire}
          onNewRecommendation={handleNewRecommendation}
          onToggleFavorite={handleToggleFavorite}
          isLoading={isLoading}
        />
      )}
      
      {appState === 'history' && (
        <History
          user={user}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
};

export default Index;
