
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
  rating?: number;
  genre?: string;
  poster_url?: string;
  explanation?: string;
  is_favorited?: boolean;
  content_type: "movie" | "book" | "both";
  created_at: string;
  description?: string;
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
      rating: recommendation.rating || null,
      is_favorited: recommendation.is_favorited || false,
      content_type: recommendation.content_type,
      director: recommendation.director || null,
      author: recommendation.author || null,
      year: recommendation.year || null,
    };

    const { data: rawData, error } = await supabase
      .from("recommendations")
      .insert(dbRecommendation)
      .select()
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
      rating: data.rating || 0,
      genres: data.genre ? data.genre.split(", ").filter(Boolean) : [],
      poster_url: data.poster_url || undefined,
      explanation: data.explanation || undefined,
      is_favorited: data.is_favorited || false,
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
      .select("*")
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
        rating: rec.rating || 0,
        genres: rec.genre ? rec.genre.split(", ").filter(Boolean) : [],
        poster_url: rec.poster_url,
        explanation: rec.explanation,
        is_favorited: rec.is_favorited || false,
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
      .select("is_favorited")
      .eq("id", recommendationId)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    const { error } = await supabase
      .from("recommendations")
      .update({ is_favorited: !rec.is_favorited })
      .eq("id", recommendationId);

    return { error: error?.message || null };
  } catch (err) {
    return { error: "Failed to toggle favorite" };
  }
};

export const recommendationsService = {
  saveRecommendation,
  getUserRecommendations,
  toggleFavorite,
};
