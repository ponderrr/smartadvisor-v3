
import { supabase } from "@/integrations/supabase/client";
import { Recommendation } from "@/types/Recommendation";
import { databaseService } from "@/services/database";

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
  return databaseService.saveRecommendation(recommendation);
};

export const getUserRecommendations = async (): Promise<{
  data: Recommendation[];
  error: string | null;
}> => {
  return databaseService.getUserRecommendations();
};

export const toggleFavorite = async (
  recommendationId: string
): Promise<{ error: string | null }> => {
  return databaseService.toggleFavorite(recommendationId);
};

export const deleteRecommendation = async (
  recommendationId: string
): Promise<{ error: string | null }> => {
  return databaseService.deleteRecommendation(recommendationId);
};

export const recommendationsService = {
  saveRecommendation,
  getUserRecommendations,
  toggleFavorite,
  deleteRecommendation,
};
