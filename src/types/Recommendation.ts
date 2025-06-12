
export interface Recommendation {
  id: string;
  user_id: string;
  type: 'movie' | 'book';
  title: string;
  director?: string;
  author?: string;
  year: number;
  rating: string;
  genres: string[];
  poster_url?: string;
  is_favorited: boolean;
  created_at: string;
}
