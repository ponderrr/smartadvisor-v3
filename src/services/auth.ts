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
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error("Sign up error:", authError);
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: "Failed to create user" };
      }

      // Create profile after successful signup
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name,
          age,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Attempt to delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { error: "Failed to create user profile" };
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      return { error: "An unexpected error occurred during sign up" };
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return { error: error.message };
      }

      if (!data.user) {
        return { error: "No user found" };
      }

      // Verify profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile not found:", profileError);
        await supabase.auth.signOut();
        return { error: "User profile not found" };
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error during signin:", err);
      return { error: "An unexpected error occurred during sign in" };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      console.error("Unexpected error during signout:", err);
      return { error: "An unexpected error occurred during sign out" };
    }
  }

  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        return { user: null, error: userError.message };
      }

      if (!user) {
        return { user: null, error: null };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return { user: null, error: "Failed to fetch user profile" };
      }

      if (!profile) {
        return { user: null, error: "User profile not found" };
      }

      return {
        user: {
          id: user.id,
          email: user.email || "",
          name: profile.name,
          age: profile.age,
          created_at: profile.created_at,
        },
        error: null,
      };
    } catch (err) {
      console.error("Error in getCurrentUser:", err);
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
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user for profile update:", userError);
        return { error: userError.message };
      }

      if (!user) {
        return { error: "No authenticated user found" };
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name,
          age,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return { error: updateError.message };
      }

      return { error: null };
    } catch (err) {
      console.error("Unexpected error updating profile:", err);
      return { error: "An unexpected error occurred while updating profile" };
    }
  }
}

export const authService = new AuthService();
