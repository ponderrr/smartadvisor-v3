
// Mock recommendation service for demo purposes
// In production, this would integrate with OpenAI, TMDB, and Google Books APIs

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

class MockRecommendationService {
  private recommendations: Map<string, Recommendation[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add some demo recommendations
    const movieRecommendations: Recommendation[] = [
      {
        id: 'movie_1',
        type: 'movie',
        title: 'The Grand Budapest Hotel',
        description: 'A whimsical comedy-drama following the adventures of a legendary concierge and his protégé at a famous European hotel.',
        explanation: 'Based on your preference for character-driven stories with unique visual style, this Wes Anderson film offers quirky humor and stunning cinematography.',
        genre: 'Comedy Drama',
        rating: 'R',
        year: '2014',
        director: 'Wes Anderson',
        posterUrl: 'https://images.unsplash.com/photo-1489599162946-25fb45846ae9?w=300&h=450&fit=crop'
      }
    ];

    const bookRecommendations: Recommendation[] = [
      {
        id: 'book_1',
        type: 'book',
        title: 'The Seven Husbands of Evelyn Hugo',
        description: 'A reclusive Hollywood icon finally decides to give her life story to an unknown journalist, revealing stunning secrets.',
        explanation: 'This engaging novel combines glamour, mystery, and character development that matches your interest in stories with depth and intrigue.',
        genre: 'Contemporary Fiction',
        year: '2017',
        author: 'Taylor Jenkins Reid',
        posterUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=450&fit=crop'
      }
    ];

    this.recommendations.set('demo', [...movieRecommendations, ...bookRecommendations]);
  }

  async generateRecommendations(
    contentType: 'movie' | 'book' | 'both',
    answers: Record<string, string>,
    userAge: number
  ): Promise<Recommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const allRecommendations = this.recommendations.get('demo') || [];
    
    if (contentType === 'movie') {
      return allRecommendations.filter(rec => rec.type === 'movie').slice(0, 1);
    } else if (contentType === 'book') {
      return allRecommendations.filter(rec => rec.type === 'book').slice(0, 1);
    } else {
      return [
        ...allRecommendations.filter(rec => rec.type === 'movie').slice(0, 1),
        ...allRecommendations.filter(rec => rec.type === 'book').slice(0, 1)
      ];
    }
  }

  async saveRecommendation(userId: string, recommendation: Recommendation): Promise<void> {
    // In production, this would save to database
    console.log('Saving recommendation for user:', userId, recommendation);
  }

  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    // In production, this would fetch from database
    return this.recommendations.get('demo') || [];
  }

  async toggleFavorite(userId: string, recommendationId: string): Promise<void> {
    // In production, this would update database
    console.log('Toggling favorite for user:', userId, 'recommendation:', recommendationId);
  }
}

export const recommendationService = new MockRecommendationService();
export type { Recommendation };
