
// Legacy recommendation service - now using enhancedRecommendationsService
// This file exports the database service functions for backward compatibility

export { 
  saveRecommendation,
  getUserRecommendations,
  toggleFavorite,
  deleteRecommendation 
} from "@/services/database";

export const recommendationsService = {
  saveRecommendation: (recommendation: any) => import("@/services/database").then(m => m.saveRecommendation(recommendation)),
  getUserRecommendations: () => import("@/services/database").then(m => m.getUserRecommendations()),
  toggleFavorite: (id: string) => import("@/services/database").then(m => m.toggleFavorite(id)),
  deleteRecommendation: (id: string) => import("@/services/database").then(m => m.deleteRecommendation(id)),
};
