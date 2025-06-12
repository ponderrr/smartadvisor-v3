
import { supabase } from '@/integrations/supabase/client';
import { Recommendation } from '@/types/Recommendation';

export const recommendationsService = {
  async generateRecommendations(
    contentType: 'movie' | 'book' | 'both',
    answers: Record<string, string>,
    userAge: number
  ): Promise<Recommendation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockRecommendations: Omit<Recommendation, 'id' | 'user_id' | 'created_at'>[] = [];
    
    if (contentType === 'movie' || contentType === 'both') {
      mockRecommendations.push({
        type: 'movie',
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        year: 1994,
        rating: '9.3/10',
        genres: ['Drama', 'Crime'],
        poster_url: 'https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop',
        is_favorited: false,
      });
    }

    if (contentType === 'book' || contentType === 'both') {
      mockRecommendations.push({
        type: 'book',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        year: 2020,
        rating: '4.2/5',
        genres: ['Literary Fiction', 'Philosophy'],
        poster_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
        is_favorited: false,
      });
    }

    return mockRecommendations.map(rec => ({
      ...rec,
      id: `${rec.type}-${Date.now()}`,
      user_id: '',
      created_at: new Date().toISOString(),
    }));
  },

  async saveRecommendation(userId: string, recommendation: Recommendation): Promise<void> {
    const { error } = await supabase
      .from('recommendations')
      .insert({
        user_id: userId,
        type: recommendation.type,
        title: recommendation.title,
        poster_url: recommendation.poster_url,
        genre: recommendation.genres.join(', '),
        rating: recommendation.rating,
        is_favorite: recommendation.is_favorited,
      });

    if (error) {
      throw new Error('Failed to save recommendation');
    }
  },

  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
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
      user_id: rec.user_id,
      type: rec.type as 'movie' | 'book',
      title: rec.title,
      year: 2024,
      rating: rec.rating || '0/10',
      genres: rec.genre ? rec.genre.split(', ') : [],
      poster_url: rec.poster_url || undefined,
      is_favorited: rec.is_favorite,
      created_at: rec.created_at,
    }));
  },

  async toggleFavorite(userId: string, recommendationId: string): Promise<void> {
    const { data: current, error: fetchError } = await supabase
      .from('recommendations')
      .select('is_favorite')
      .eq('id', recommendationId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch recommendation');
    }

    const { error } = await supabase
      .from('recommendations')
      .update({ is_favorite: !current.is_favorite })
      .eq('id', recommendationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to update favorite status');
    }
  },
};
