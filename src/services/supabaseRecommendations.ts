
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

class RecommendationService {
  async saveRecommendation(userId: string, recommendation: any) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .insert({
          user_id: userId,
          type: recommendation.type,
          title: recommendation.title,
          description: recommendation.description || '',
          explanation: recommendation.explanation || '',
          genre: recommendation.genre || '',
          rating: recommendation.rating ? parseFloat(recommendation.rating.toString()) : null,
          year: recommendation.year ? parseInt(recommendation.year.toString()) : null,
          author: recommendation.author || null,
          director: recommendation.director || null,
          poster_url: recommendation.posterUrl || null,
          is_favorited: false,
          content_type: recommendation.contentType || 'both'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving recommendation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to save recommendation:', error);
      throw error;
    }
  }

  async getUserRecommendations(userId: string): Promise<RecommendationItem[]> {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }

      return data?.map(rec => ({
        id: rec.id,
        type: rec.type as 'movie' | 'book',
        title: rec.title,
        description: rec.description || '',
        explanation: rec.explanation || '',
        genre: rec.genre || '',
        rating: rec.rating?.toString(),
        year: rec.year?.toString(),
        author: rec.author,
        director: rec.director,
        posterUrl: rec.poster_url,
        isFavorite: rec.is_favorited
      })) || [];
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }
  }

  async toggleFavorite(userId: string, recommendationId: string) {
    try {
      // First get the current state
      const { data: current, error: fetchError } = await supabase
        .from('recommendations')
        .select('is_favorited')
        .eq('id', recommendationId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle the favorite status
      const { data, error } = await supabase
        .from('recommendations')
        .update({
          is_favorited: !current.is_favorited
        })
        .eq('id', recommendationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling favorite:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  async deleteRecommendation(userId: string, recommendationId: string) {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', recommendationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting recommendation:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete recommendation:', error);
      throw error;
    }
  }
}

export const recommendationService = new RecommendationService();
