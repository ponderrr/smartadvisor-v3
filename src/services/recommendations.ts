import { supabase } from "@/integrations/supabase/client";
import { Recommendation } from "@/types/Recommendation";

interface RecommendationTableRow {
  id: string;
  user_id: string;
  type: "movie" | "book";
  title: string;
  director?: string;
  author?: string;
  year?: number;
  rating: string;
  genre: string;
  poster_url?: string;
  explanation?: string;
  is_favorite: boolean;
  content_type: "movie" | "book" | "both";
  created_at: string;
  description?: string;
}

interface QuestionnaireResponse {
  id: string;
  user_id: string;
  content_type: "movie" | "book" | "both";
  questions: any[];
  answers: any[];
  created_at: string;
}

export const saveRecommendation = async (
  recommendation: Omit<Recommendation, "id" | "created_at">
): Promise<{ data: Recommendation | null; error: string | null }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    // Convert the recommendation to match database schema
    const dbRecommendation = {
      user_id: user.id,
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description || "",
      explanation: recommendation.explanation || "",
      poster_url: recommendation.poster_url || "",
      genre: Array.isArray(recommendation.genres)
        ? recommendation.genres.join(", ")
        : "",
      rating: recommendation.rating?.toString() || "0",
      is_favorite: recommendation.is_favorited || false,
      content_type: recommendation.content_type,
      director: recommendation.director || undefined,
      author: recommendation.author || undefined,
      year: recommendation.year || undefined,
    };

    const { data: rawData, error } = await supabase
      .from("recommendations")
      .insert(dbRecommendation)
      .select(
        "id, user_id, type, title, director, author, year, rating, genre, poster_url, explanation, is_favorite, content_type, created_at, description"
      )
      .single<RecommendationTableRow>();

    if (error) {
      console.error("Error saving recommendation:", error);
      return { data: null, error: error.message };
    }

    const data: RecommendationTableRow = rawData;

    // Convert back to our Recommendation type
    const savedRecommendation: Recommendation = {
      id: data.id,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      director: data.director || undefined,
      author: data.author || undefined,
      year: data.year || undefined,
      rating: parseFloat(data.rating) || 0,
      genres: data.genre ? data.genre.split(", ").filter(Boolean) : [],
      poster_url: data.poster_url || undefined,
      explanation: data.explanation || undefined,
      is_favorited: data.is_favorite,
      content_type: data.content_type,
      created_at: data.created_at,
      description: data.description || undefined,
    };

    return { data: savedRecommendation, error: null };
  } catch (err) {
    console.error("Error in saveRecommendation:", err);
    return { data: null, error: "Failed to save recommendation" };
  }
};

export const getUserRecommendations = async (): Promise<{
  data: Recommendation[];
  error: string | null;
}> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("recommendations")
      .select(
        "id, user_id, type, title, director, author, year, rating, genre, poster_url, explanation, is_favorite, content_type, created_at, description"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<RecommendationTableRow[]>();

    if (error) {
      console.error("Error fetching recommendations:", error);
      return { data: [], error: error.message };
    }

    // Convert database records to our Recommendation type
    const recommendations: Recommendation[] = data.map(
      (rec: RecommendationTableRow) => ({
        id: rec.id,
        user_id: rec.user_id,
        type: rec.type,
        title: rec.title,
        director: rec.director,
        author: rec.author,
        year: rec.year,
        rating: parseFloat(rec.rating) || 0,
        genres: rec.genre ? rec.genre.split(", ").filter(Boolean) : [],
        poster_url: rec.poster_url,
        explanation: rec.explanation,
        is_favorited: rec.is_favorite,
        content_type: rec.content_type,
        created_at: rec.created_at,
        description: rec.description,
      })
    );

    return { data: recommendations, error: null };
  } catch (err) {
    console.error("Error in getUserRecommendations:", err);
    return { data: [], error: "Failed to fetch recommendations" };
  }
};

export const toggleFavorite = async (
  recommendationId: string
): Promise<{ error: string | null }> => {
  try {
    const { data: rec, error: fetchError } = await supabase
      .from("recommendations")
      .select("is_favorite")
      .eq("id", recommendationId)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    const { error } = await supabase
      .from("recommendations")
      .update({ is_favorite: !rec.is_favorite })
      .eq("id", recommendationId);

    return { error: error?.message || null };
  } catch (err) {
    return { error: "Failed to toggle favorite" };
  }
};

// Mock function for generating recommendations (placeholder)
export const generateMockRecommendations = async (
  contentType: "movie" | "book" | "both"
): Promise<Recommendation[]> => {
  const mockMovies: Recommendation[] = [
    {
      id: "mock-movie-1",
      user_id: "user-1",
      type: "movie",
      title: "The Shawshank Redemption",
      director: "Frank Darabont",
      author: undefined,
      year: 1994,
      rating: 9.3,
      genres: ["Drama"],
      poster_url: "https://example.com/shawshank.jpg",
      explanation: "A powerful story of hope and friendship.",
      is_favorited: false,
      content_type: contentType,
      created_at: new Date().toISOString(),
      description: "Two imprisoned men bond over a number of years.",
    },
  ];

  const mockBooks: Recommendation[] = [
    {
      id: "mock-book-1",
      user_id: "user-1",
      type: "book",
      title: "To Kill a Mockingbird",
      director: undefined,
      author: "Harper Lee",
      year: 1960,
      rating: 4.3,
      genres: ["Fiction", "Classic"],
      poster_url: "https://example.com/mockingbird.jpg",
      explanation: "A timeless tale of moral courage.",
      is_favorited: false,
      content_type: contentType,
      created_at: new Date().toISOString(),
      description: "A story of racial injustice and childhood innocence.",
    },
  ];

  switch (contentType) {
    case "movie":
      return mockMovies;
    case "book":
      return mockBooks;
    case "both":
      return [...mockMovies, ...mockBooks];
    default:
      return [];
  }
};

export const recommendationsService = {
  saveRecommendation,
  getUserRecommendations,
  toggleFavorite,
  generateMockRecommendations,
};
