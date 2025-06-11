
import { supabase } from '@/integrations/supabase/client';

export interface RecommendationItem {
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

class SupabaseRecommendationService {
  async generateRecommendations(
    contentType: 'movie' | 'book' | 'both',
    answers: Record<string, string>,
    userAge: number
  ): Promise<RecommendationItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const recommendations: RecommendationItem[] = [];
    
    if (contentType === 'movie' || contentType === 'both') {
      recommendations.push({
        id: `movie-${Date.now()}`,
        type: 'movie',
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        explanation: `Based on your preference for ${answers.genre || 'drama'} and ${answers.mood || 'thoughtful'} content, this classic film offers deep character development and hope.`,
        genre: 'Drama',
        rating: '9.3/10',
        year: '1994',
        director: 'Frank Darabont',
        posterUrl: 'https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop',
        isFavorite: false,
      });
    }

    if (contentType === 'book' || contentType === 'both') {
      recommendations.push({
        id: `book-${Date.now()}`,
        type: 'book',
        title: 'The Midnight Library',
        description: 'Between life and death there is a library, and within that library, the shelves go on forever.',
        explanation: `Given your interest in ${answers.theme || 'life choices'} and ${answers.setting || 'contemporary'} stories, this philosophical novel explores different life paths.`,
        genre: 'Literary Fiction',
        rating: '4.2/5',
        year: '2020',
        author: 'Matt Haig',
        posterUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
        isFavorite: false,
      });
    }

    return recommendations;
  }

  async saveRecommendation(userId: string, recommendation: RecommendationItem): Promise<void> {
    const { error } = await supabase
      .from('recommendations')
      .insert({
        user_id: userId,
        type: recommendation.type,
        title: recommendation.title,
        description: recommendation.description,
        explanation: recommendation.explanation,
        poster_url: recommendation.posterUrl,
        genre: recommendation.genre,
        rating: recommendation.rating,
        is_favorite: recommendation.isFavorite || false,
      });

    if (error) {
      throw new Error('Failed to save recommendation');
    }
  }

  async getUserRecommendations(userId: string): Promise<RecommendationItem[]> {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to load recommendations');
    }

    return data.map(rec => ({
      id: rec.id,
      type: rec.type as 'movie' | 'book',
      title: rec.title,
      description: rec.description || '',
      explanation: rec.explanation || '',
      genre: rec.genre || '',
      rating: rec.rating || undefined,
      posterUrl: rec.poster_url || undefined,
      isFavorite: rec.is_favorite,
    }));
  }

  async toggleFavorite(userId: string, recommendationId: string): Promise<void> {
    // Get current favorite status
    const { data: current, error: fetchError } = await supabase
      .from('recommendations')
      .select('is_favorite')
      .eq('id', recommendationId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch recommendation');
    }

    // Toggle the favorite status
    const { error } = await supabase
      .from('recommendations')
      .update({ is_favorite: !current.is_favorite })
      .eq('id', recommendationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to update favorite status');
    }
  }
}

export const recommendationService = new SupabaseRecommendationService();
