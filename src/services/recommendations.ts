
import { supabase } from '@/integrations/supabase/client';
import { Recommendation } from '@/types/Recommendation';

interface QuestionnaireResponse {
  id: string;
  user_id: string;
  content_type: 'movie' | 'book' | 'both';
  questions: any[];
  answers: any[];
  created_at: string;
}

export const saveRecommendation = async (recommendation: Omit<Recommendation, 'id' | 'created_at'>): Promise<{ data: Recommendation | null, error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Convert the recommendation to match database schema
    const dbRecommendation = {
      user_id: user.id,
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description || '',
      explanation: recommendation.explanation || '',
      poster_url: recommendation.poster_url || '',
      genre: Array.isArray(recommendation.genre) ? recommendation.genre.join(', ') : recommendation.genre || '',
      rating: recommendation.rating?.toString() || '0',
      is_favorite: recommendation.is_favorited || false,
    };

    const { data, error } = await supabase
      .from('recommendations')
      .insert(dbRecommendation)
      .select()
      .single();

    if (error) {
      console.error('Error saving recommendation:', error);
      return { data: null, error: error.message };
    }

    // Convert back to our Recommendation type
    const savedRecommendation: Recommendation = {
      id: data.id,
      user_id: data.user_id,
      type: data.type as 'movie' | 'book',
      title: data.title,
      director: recommendation.director,
      author: recommendation.author,
      year: recommendation.year,
      rating: parseFloat(data.rating) || 0,
      genre: data.genre.split(', ').filter(Boolean),
      poster_url: data.poster_url,
      explanation: data.explanation,
      is_favorited: data.is_favorite,
      content_type: recommendation.content_type,
      created_at: data.created_at,
      description: data.description,
    };

    return { data: savedRecommendation, error: null };
  } catch (err) {
    console.error('Error in saveRecommendation:', err);
    return { data: null, error: 'Failed to save recommendation' };
  }
};

export const getUserRecommendations = async (): Promise<{ data: Recommendation[], error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return { data: [], error: error.message };
    }

    // Convert database records to our Recommendation type
    const recommendations: Recommendation[] = data.map(rec => ({
      id: rec.id,
      user_id: rec.user_id,
      type: rec.type as 'movie' | 'book',
      title: rec.title,
      director: undefined, // Not stored in current schema
      author: undefined, // Not stored in current schema
      year: undefined, // Not stored in current schema
      rating: parseFloat(rec.rating) || 0,
      genre: rec.genre ? rec.genre.split(', ').filter(Boolean) : [],
      poster_url: rec.poster_url,
      explanation: rec.explanation,
      is_favorited: rec.is_favorite,
      content_type: 'both', // Default since not in current schema
      created_at: rec.created_at,
      description: rec.description,
    }));

    return { data: recommendations, error: null };
  } catch (err) {
    console.error('Error in getUserRecommendations:', err);
    return { data: [], error: 'Failed to fetch recommendations' };
  }
};

export const toggleFavorite = async (recommendationId: string): Promise<{ error: string | null }> => {
  try {
    const { data: rec, error: fetchError } = await supabase
      .from('recommendations')
      .select('is_favorite')
      .eq('id', recommendationId)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    const { error } = await supabase
      .from('recommendations')
      .update({ is_favorite: !rec.is_favorite })
      .eq('id', recommendationId);

    return { error: error?.message || null };
  } catch (err) {
    return { error: 'Failed to toggle favorite' };
  }
};

// Mock function for generating recommendations (placeholder)
export const generateMockRecommendations = async (contentType: 'movie' | 'book' | 'both'): Promise<Recommendation[]> => {
  const mockMovies: Recommendation[] = [
    {
      id: 'mock-movie-1',
      user_id: 'user-1',
      type: 'movie',
      title: 'The Shawshank Redemption',
      director: 'Frank Darabont',
      author: undefined,
      year: 1994,
      rating: 9.3,
      genre: ['Drama'],
      poster_url: 'https://example.com/shawshank.jpg',
      explanation: 'A powerful story of hope and friendship.',
      is_favorited: false,
      content_type: contentType,
      created_at: new Date().toISOString(),
      description: 'Two imprisoned men bond over a number of years.',
    }
  ];

  const mockBooks: Recommendation[] = [
    {
      id: 'mock-book-1',
      user_id: 'user-1',
      type: 'book',
      title: 'To Kill a Mockingbird',
      director: undefined,
      author: 'Harper Lee',
      year: 1960,
      rating: 4.3,
      genre: ['Fiction', 'Classic'],
      poster_url: 'https://example.com/mockingbird.jpg',
      explanation: 'A timeless tale of moral courage.',
      is_favorited: false,
      content_type: contentType,
      created_at: new Date().toISOString(),
      description: 'A story of racial injustice and childhood innocence.',
    }
  ];

  switch (contentType) {
    case 'movie':
      return mockMovies;
    case 'book':
      return mockBooks;
    case 'both':
      return [...mockMovies, ...mockBooks];
    default:
      return [];
  }
};
