
import { supabase } from '@/integrations/supabase/client';
import { Recommendation } from '@/types/Recommendation';

export interface CreateRecommendationData {
  type: 'movie' | 'book';
  title: string;
  director?: string;
  author?: string;
  year?: number;
  rating?: number;
  genres: string[];
  poster_url?: string;
  explanation?: string;
  content_type: 'movie' | 'book' | 'both';
}

export interface QuestionnaireResponse {
  content_type: 'movie' | 'book' | 'both';
  questions: any[];
  answers: any[];
}

class RecommendationsService {
  async saveRecommendation(userId: string, data: CreateRecommendationData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('recommendations')
        .insert({
          user_id: userId,
          type: data.type,
          title: data.title,
          director: data.director,
          author: data.author,
          year: data.year,
          rating: data.rating,
          genres: data.genres,
          poster_url: data.poster_url,
          explanation: data.explanation,
          is_favorited: false,
          content_type: data.content_type,
        });

      return { error: error ? error.message : null };
    } catch (err) {
      return { error: 'Failed to save recommendation' };
    }
  }

  async getUserRecommendations(userId: string): Promise<{ data: Recommendation[] | null, error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      const recommendations: Recommendation[] = data.map(rec => ({
        id: rec.id,
        user_id: rec.user_id,
        type: rec.type as 'movie' | 'book',
        title: rec.title,
        director: rec.director,
        author: rec.author,
        year: rec.year,
        rating: rec.rating,
        genres: rec.genres || [],
        poster_url: rec.poster_url,
        explanation: rec.explanation,
        is_favorited: rec.is_favorited,
        content_type: rec.content_type as 'movie' | 'book' | 'both',
        created_at: rec.created_at,
      }));

      return { data: recommendations, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to load recommendations' };
    }
  }

  async toggleFavorite(userId: string, recommendationId: string): Promise<{ error: string | null }> {
    try {
      // Get current favorite status
      const { data: current, error: fetchError } = await supabase
        .from('recommendations')
        .select('is_favorited')
        .eq('id', recommendationId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return { error: 'Failed to fetch recommendation' };
      }

      // Toggle the favorite status
      const { error } = await supabase
        .from('recommendations')
        .update({ is_favorited: !current.is_favorited })
        .eq('id', recommendationId)
        .eq('user_id', userId);

      return { error: error ? error.message : null };
    } catch (err) {
      return { error: 'Failed to update favorite status' };
    }
  }

  async saveQuestionnaireResponse(userId: string, response: QuestionnaireResponse): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('questionnaire_responses')
        .insert({
          user_id: userId,
          content_type: response.content_type,
          questions: response.questions,
          answers: response.answers,
        });

      return { error: error ? error.message : null };
    } catch (err) {
      return { error: 'Failed to save questionnaire response' };
    }
  }

  async generateRecommendations(
    contentType: 'movie' | 'book' | 'both',
    answers: Record<string, string>,
    userAge: number
  ): Promise<{ data: Recommendation[] | null, error: string | null }> {
    try {
      // Simulate API delay for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockRecommendations: Omit<Recommendation, 'id' | 'user_id' | 'created_at'>[] = [];
      
      if (contentType === 'movie' || contentType === 'both') {
        mockRecommendations.push({
          type: 'movie',
          title: 'The Shawshank Redemption',
          director: 'Frank Darabont',
          year: 1994,
          rating: 9.3,
          genres: ['Drama', 'Crime'],
          poster_url: 'https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop',
          explanation: 'Based on your preferences, this classic drama offers compelling character development and themes of hope.',
          is_favorited: false,
          content_type: contentType,
        });
      }

      if (contentType === 'book' || contentType === 'both') {
        mockRecommendations.push({
          type: 'book',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          year: 2020,
          rating: 4.2,
          genres: ['Literary Fiction', 'Philosophy'],
          poster_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
          explanation: 'This thought-provoking novel explores themes of regret and possibility, perfect for your interests.',
          is_favorited: false,
          content_type: contentType,
        });
      }

      const recommendations = mockRecommendations.map(rec => ({
        ...rec,
        id: `${rec.type}-${Date.now()}`,
        user_id: '',
        created_at: new Date().toISOString(),
      }));

      return { data: recommendations, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to generate recommendations' };
    }
  }
}

export const recommendationsService = new RecommendationsService();
