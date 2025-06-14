import { generateRecommendations } from "@/services/openai";
import { tmdbService } from "@/services/tmdb";
import { googleBooksService } from "@/services/googleBooks";
import { databaseService } from "@/services/database";
import { Recommendation } from "@/types/Recommendation";

interface QuestionnaireData {
  answers: any[];
  contentType: "movie" | "book" | "both";
  userAge: number;
}

class EnhancedRecommendationsService {
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000;

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retryRecommendation(
    questionnaireData: any,
    userId: string,
    retryCount = 0
  ): Promise<Recommendation[]> {
    try {
      const recommendations = await this.generateEnhancedRecommendations(questionnaireData, userId);
      return recommendations;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Recommendation generation attempt ${retryCount + 1} failed:`, error);
      }
      
      if (retryCount < this.MAX_RETRIES) {
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.retryRecommendation(questionnaireData, userId, retryCount + 1);
      }
      
      throw new Error(`Failed to generate recommendations after ${this.MAX_RETRIES + 1} attempts`);
    }
  }

  async generateEnhancedRecommendations(
    questionnaireData: any,
    userId: string
  ): Promise<Recommendation[]> {
    const { answers, contentType, userAge } = questionnaireData;

    if (import.meta.env.DEV) {
      console.log('Starting enhanced recommendation generation:', { contentType, userAge });
    }

    // Generate base recommendations using OpenAI
    const aiRecommendations = await generateRecommendations(answers, contentType, userAge);
    
    if (import.meta.env.DEV) {
      console.log('AI recommendations generated:', aiRecommendations);
    }

    // Enhance with external API data and save to database
    const enhancedRecommendations = await Promise.all(
      aiRecommendations.map(async (rec) => {
        try {
          let enhancedRec = { ...rec };

          // Enhance movies with TMDB data
          if (rec.type === 'movie') {
            try {
              const tmdbData = await tmdbService.searchMovie(rec.title);
              if (tmdbData) {
                enhancedRec = {
                  ...enhancedRec,
                  poster_url: tmdbData.poster_url || rec.poster_url,
                  rating: tmdbData.rating || rec.rating,
                  genres: tmdbData.genres || rec.genres,
                  year: tmdbData.year || rec.year,
                  director: tmdbData.director || rec.director,
                };
              }
            } catch (tmdbError) {
              if (import.meta.env.DEV) {
                console.warn('TMDB enhancement failed for:', rec.title, tmdbError);
              }
            }
          }

          // Enhance books with Google Books data
          if (rec.type === 'book') {
            try {
              const bookData = await googleBooksService.searchBook(rec.title, rec.author);
              if (bookData) {
                enhancedRec = {
                  ...enhancedRec,
                  poster_url: bookData.cover_url || rec.poster_url,
                  rating: bookData.rating || rec.rating,
                  genres: bookData.genres || rec.genres,
                  year: bookData.published_year || rec.year,
                  author: bookData.author || rec.author,
                };
              }
            } catch (bookError) {
              if (import.meta.env.DEV) {
                console.warn('Google Books enhancement failed for:', rec.title, bookError);
              }
            }
          }

          // Save to database
          const { data: savedRec, error } = await databaseService.saveRecommendation({
            ...enhancedRec,
            user_id: userId,
          });

          if (error) {
            if (import.meta.env.DEV) {
              console.error('Failed to save recommendation:', error);
            }
            return enhancedRec; // Return enhanced but unsaved recommendation
          }

          return savedRec || enhancedRec;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error enhancing recommendation:', error);
          }
          return rec; // Return original recommendation if enhancement fails
        }
      })
    );

    if (import.meta.env.DEV) {
      console.log('Enhanced recommendations completed:', enhancedRecommendations.length);
    }

    return enhancedRecommendations;
  }
}

export const enhancedRecommendationsService = new EnhancedRecommendationsService();
