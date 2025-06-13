
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

class EnhancedRecommendationsService {
  async generateFullRecommendation(
    questionnaireData: QuestionnaireData,
    userId: string
  ): Promise<Recommendation[]> {
    const { answers, contentType, userAge } = questionnaireData;

    try {
      console.log('Starting AI recommendation generation for:', { contentType, userAge, answersCount: answers.length });

      // 1. Call OpenAI to get AI-generated recommendations
      const aiRecommendations = await generateRecommendationsWithRetry(
        answers,
        contentType,
        userAge
      );

      console.log('AI recommendations received:', aiRecommendations);

      const recommendations: Recommendation[] = [];

      // 2. Process movie recommendation
      if (aiRecommendations.movieRecommendation) {
        const movieRec = aiRecommendations.movieRecommendation;
        console.log('Processing movie recommendation:', movieRec.title);

        // Enhance with TMDB data
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

        // Save to Supabase
        const { data, error } = await recommendationsService.saveRecommendation(
          movieRecommendation
        );

        if (!error && data) {
          recommendations.push(data);
          console.log('Movie recommendation saved successfully');
        } else {
          console.error('Error saving movie recommendation:', error);
        }
      }

      // 3. Process book recommendation
      if (aiRecommendations.bookRecommendation) {
        const bookRec = aiRecommendations.bookRecommendation;
        console.log('Processing book recommendation:', bookRec.title);

        // Enhance with Google Books data
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

        // Save to Supabase
        const { data, error } = await recommendationsService.saveRecommendation(
          bookRecommendation
        );

        if (!error && data) {
          recommendations.push(data);
          console.log('Book recommendation saved successfully');
        } else {
          console.error('Error saving book recommendation:', error);
        }
      }

      console.log('Final recommendations generated:', recommendations.length);
      return recommendations;
    } catch (error) {
      console.error("Error generating full recommendation:", error);
      throw new Error("Failed to generate AI-powered recommendations. Please try again.");
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
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
        }
      }
    }

    throw lastError;
  }
}

export const enhancedRecommendationsService =
  new EnhancedRecommendationsService();
