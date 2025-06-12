
import { Recommendation } from '@/types/Recommendation';
import { Answer } from '@/types/Answer';
import { openaiService } from './openai';
import { tmdbService } from './tmdb';
import { googleBooksService } from './googleBooks';
import { recommendationsService } from './recommendations';

export interface QuestionnaireData {
  answers: Answer[];
  contentType: 'movie' | 'book' | 'both';
  userAge: number;
}

class EnhancedRecommendationsService {
  async generateFullRecommendation(
    questionnaireData: QuestionnaireData,
    userId: string
  ): Promise<Recommendation[]> {
    const { answers, contentType, userAge } = questionnaireData;

    try {
      // 1. Call OpenAI to get recommendations
      const aiRecommendations = await openaiService.generateRecommendations(
        answers,
        contentType,
        userAge
      );

      const recommendations: Recommendation[] = [];

      // 2. Process movie recommendation
      if (aiRecommendations.movieRecommendation) {
        const movieRec = aiRecommendations.movieRecommendation;
        
        // Enhance with TMDB data
        const tmdbData = await tmdbService.searchMovie(movieRec.title);
        
        const movieRecommendation: Omit<Recommendation, 'id' | 'created_at'> = {
          user_id: userId,
          type: 'movie',
          title: movieRec.title,
          director: movieRec.director,
          author: undefined,
          year: tmdbData.year || movieRec.year,
          rating: tmdbData.rating || 7.5,
          genres: movieRec.genres,
          poster_url: tmdbData.poster,
          explanation: movieRec.explanation,
          is_favorited: false,
          content_type: contentType,
        };

        // Save to Supabase
        const { error } = await recommendationsService.saveRecommendation(userId, {
          type: movieRecommendation.type,
          title: movieRecommendation.title,
          director: movieRecommendation.director,
          year: movieRecommendation.year,
          rating: movieRecommendation.rating,
          genres: movieRecommendation.genres,
          poster_url: movieRecommendation.poster_url,
          explanation: movieRecommendation.explanation,
          content_type: movieRecommendation.content_type,
        });

        if (!error) {
          recommendations.push({
            ...movieRecommendation,
            id: `movie-${Date.now()}`,
            created_at: new Date().toISOString(),
          });
        }
      }

      // 3. Process book recommendation
      if (aiRecommendations.bookRecommendation) {
        const bookRec = aiRecommendations.bookRecommendation;
        
        // Enhance with Google Books data
        const booksData = await googleBooksService.searchBook(bookRec.title, bookRec.author);
        
        const bookRecommendation: Omit<Recommendation, 'id' | 'created_at'> = {
          user_id: userId,
          type: 'book',
          title: bookRec.title,
          director: undefined,
          author: bookRec.author,
          year: booksData.year || bookRec.year,
          rating: booksData.rating || 4.2,
          genres: bookRec.genres,
          poster_url: booksData.cover,
          explanation: bookRec.explanation,
          is_favorited: false,
          content_type: contentType,
        };

        // Save to Supabase
        const { error } = await recommendationsService.saveRecommendation(userId, {
          type: bookRecommendation.type,
          title: bookRecommendation.title,
          author: bookRecommendation.author,
          year: bookRecommendation.year,
          rating: bookRecommendation.rating,
          genres: bookRecommendation.genres,
          poster_url: bookRecommendation.poster_url,
          explanation: bookRecommendation.explanation,
          content_type: bookRecommendation.content_type,
        });

        if (!error) {
          recommendations.push({
            ...bookRecommendation,
            id: `book-${Date.now()}`,
            created_at: new Date().toISOString(),
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating full recommendation:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  async retryRecommendation(
    questionnaireData: QuestionnaireData,
    userId: string,
    retryCount = 3
  ): Promise<Recommendation[]> {
    let lastError;

    for (let i = 0; i < retryCount; i++) {
      try {
        return await this.generateFullRecommendation(questionnaireData, userId);
      } catch (error) {
        lastError = error;
        console.log(`Retry attempt ${i + 1} failed:`, error);
        
        // Wait before retrying (exponential backoff)
        if (i < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }

    throw lastError;
  }
}

export const enhancedRecommendationsService = new EnhancedRecommendationsService();
