
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

    console.log("Generating AI recommendations for user:", userId);
    console.log("Content type:", contentType, "User age:", userAge);

    const aiRecommendations = await generateRecommendationsWithRetry(
      answers,
      contentType,
      userAge
    );

    console.log("AI recommendations received:", aiRecommendations);

    const recommendations: Recommendation[] = [];

    // Process movie recommendation
    if (aiRecommendations.movieRecommendation) {
      const movieRec = aiRecommendations.movieRecommendation;
      console.log("Processing movie recommendation:", movieRec.title);
      
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
        console.log("Movie recommendation saved:", data.id);
        recommendations.push(data);
      } else {
        console.error("Error saving movie recommendation:", error);
      }
    }

    // Process book recommendation
    if (aiRecommendations.bookRecommendation) {
      const bookRec = aiRecommendations.bookRecommendation;
      console.log("Processing book recommendation:", bookRec.title);
      
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
        console.log("Book recommendation saved:", data.id);
        recommendations.push(data);
      } else {
        console.error("Error saving book recommendation:", error);
      }
    }

    console.log("Total recommendations generated:", recommendations.length);
    return recommendations;
  }

  /**
   * Retry mechanism for recommendation generation with exponential backoff
   */
  async retryRecommendation(
    questionnaireData: QuestionnaireData,
    userId: string,
    retryCount = 3
  ): Promise<Recommendation[]> {
    let lastError;

    for (let i = 0; i < retryCount; i++) {
      try {
        console.log(`Recommendation generation attempt ${i + 1} of ${retryCount}`);
        return await this.generateFullRecommendation(questionnaireData, userId);
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${i + 1} failed:`, error);

        if (i < retryCount - 1) {
          const delay = Math.pow(2, i) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) =>
            setTimeout(resolve, delay)
          );
        }
      }
    }

    throw lastError;
  }
}

export const enhancedRecommendationsService = new EnhancedRecommendationsService();
