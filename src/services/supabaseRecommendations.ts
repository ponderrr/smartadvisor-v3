import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/Question";
import { Answer } from "@/types/Answer";
import { MovieRecommendation, BookRecommendation } from "./openai";
import { Database } from "@/types/database.types";

type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];

/**
 * Save a recommendation to the database
 */
export async function saveRecommendation(
  contentType: "movie" | "book" | "both",
  movieRecommendation?: MovieRecommendation,
  bookRecommendation?: BookRecommendation,
  questions?: Question[],
  answers?: Answer[]
): Promise<Recommendation> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to save recommendations");
    }

    const { data, error } = await supabase
      .from("recommendations")
      .insert({
        user_id: user.id,
        content_type: contentType,
        movie_recommendation: movieRecommendation,
        book_recommendation: bookRecommendation,
        questions: questions || [],
        answers: answers || [],
        genres: [
          ...(movieRecommendation?.genres || []),
          ...(bookRecommendation?.genres || []),
        ],
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving recommendation:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in saveRecommendation:", error);
    throw error;
  }
}

/**
 * Get all recommendations for the current user
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to get recommendations");
    }

    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    throw error;
  }
}

/**
 * Get a specific recommendation by ID
 */
export async function getRecommendation(id: string): Promise<Recommendation> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to get recommendations");
    }

    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching recommendation:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Recommendation not found");
    }

    return data;
  } catch (error) {
    console.error("Error in getRecommendation:", error);
    throw error;
  }
}

/**
 * Toggle favorite status for a recommendation
 */
export async function toggleFavorite(id: string): Promise<Recommendation> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to update recommendations");
    }

    // First get the current state
    const { data: current, error: fetchError } = await supabase
      .from("recommendations")
      .select("is_favorited")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching recommendation:", fetchError);
      throw new Error(fetchError.message);
    }

    // Then update to the opposite state
    const { data, error } = await supabase
      .from("recommendations")
      .update({ is_favorited: !current.is_favorited })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating recommendation:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    throw error;
  }
}

/**
 * Delete a recommendation
 */
export async function deleteRecommendation(id: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to delete recommendations");
    }

    const { error } = await supabase
      .from("recommendations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting recommendation:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in deleteRecommendation:", error);
    throw error;
  }
}

/**
 * Get favorite recommendations for the current user
 */
export async function getFavoriteRecommendations(): Promise<Recommendation[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User must be authenticated to get recommendations");
    }

    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_favorited", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorite recommendations:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in getFavoriteRecommendations:", error);
    throw error;
  }
}
