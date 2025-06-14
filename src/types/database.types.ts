export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          content_type: "movie" | "book" | "both";
          movie_recommendation: Json | null;
          book_recommendation: Json | null;
          questions: Json[];
          answers: Json[];
          genres: string[];
          created_at: string;
          is_favorited: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: "movie" | "book" | "both";
          movie_recommendation?: Json | null;
          book_recommendation?: Json | null;
          questions?: Json[];
          answers?: Json[];
          genres?: string[];
          created_at?: string;
          is_favorited?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_type?: "movie" | "book" | "both";
          movie_recommendation?: Json | null;
          book_recommendation?: Json | null;
          questions?: Json[];
          answers?: Json[];
          genres?: string[];
          created_at?: string;
          is_favorited?: boolean;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          age: number;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          age: number;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          age?: number;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
