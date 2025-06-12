import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/User";

export interface AuthError {
  message: string;
}

class AuthService {
  async signUp(
    email: string,
    password: string,
    name: string,
    age: number
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      return { error: error?.message || null };
    } catch (err) {
      return { error: "Failed to sign up" };
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error?.message || null };
    } catch (err) {
      return { error: "Failed to sign in" };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (err) {
      return { error: "Failed to sign out" };
    }
  }

  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return { user: null, error: error?.message || "No user found" };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        return { user: null, error: "Profile not found" };
      }

      const userData: User = {
        id: user.id,
        email: user.email,
        name: profile.name,
        age: profile.age,
        created_at: profile.created_at,
      };

      return { user: userData, error: null };
    } catch (err) {
      return { user: null, error: "Failed to get current user" };
    }
  }

  async updateProfile({
    name,
    age,
  }: {
    name: string;
    age: number;
  }): Promise<{ error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { error: "No authenticated user" };
      }

      const { error } = await supabase
        .from("profiles")
        .update({ name, age, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      return { error: error?.message || null };
    } catch (err) {
      return { error: "Failed to update profile" };
    }
  }
}

export const authService = new AuthService();
