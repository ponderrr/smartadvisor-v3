
import { Recommendation } from "@/types/Recommendation";
import { Answer } from "@/types/Answer";
import { generateRecommendationsWithRetry } from "./openai";
import { tmdbService } from "./tmdb";
import { googleBooksService } from "./googleBooks";
import { recommendationsService } from "./recommendations";

export interface QuestionnaireData {
  answers: Answer[];
  contentType: "movie" | "book" | "both";
  userAge: number;
}

/**
 * Enhanced recommendations service that combines AI generation with external data enrichment
 */
class EnhancedRecommendationsService {
  /**
   * Generates complete recommendations with AI + external data
   */
  async generateFullRecommendation(
    questionnaireData: QuestionnaireData,
    userId: string
  ): Promise<Recommendation[]> {
    const { answers, contentType, userAge } = questionnaireData;

    const aiRecommendations = await generateRecommendationsWithRetry(
      answers,
      contentType,
      userAge
    );

    const recommendations: Recommendation[] = [];

    // Process movie recommendation
    if (aiRecommendations.movieRecommendation) {
      const movieRec = aiRecommendations.movieRecommendation;
      const tmdbData = await tmdbService.searchMovie(movieRec.title);

      const movieRecommendation: Omit<Recommendation, "id" | "created_at"> = {
        user_id: userId,
        type: "movie",
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

      const { data, error } = await recommendationsService.saveRecommendation(
        movieRecommendation
      );

      if (!error && data) {
        recommendations.push(data);
      }
    }

    // Process book recommendation
    if (aiRecommendations.bookRecommendation) {
      const bookRec = aiRecommendations.bookRecommendation;
      const booksData = await googleBooksService.searchBook(
        bookRec.title,
        bookRec.author
      );

      const bookRecommendation: Omit<Recommendation, "id" | "created_at"> = {
        user_id: userId,
        type: "book",
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

      const { data, error } = await recommendationsService.saveRecommendation(
        bookRecommendation
      );

      if (!error && data) {
        recommendations.push(data);
      }
    }

    return recommendations;
  }

  /**
   * Retry mechanism for recommendation generation
   */
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

        if (i < retryCount - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
        }
      }
    }

    throw lastError;
  }
}

export const enhancedRecommendationsService = new EnhancedRecommendationsService();
