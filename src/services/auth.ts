
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
      console.log('Starting signup process for:', email);
      
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
        console.error("Sign up auth error:", authError);
        return { error: authError.message };
      }

      if (!authData.user) {
        console.error("No user returned from signup");
        return { error: "Failed to create user account" };
      }

      console.log('Auth user created successfully:', authData.user.id);

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
        
        // Try to clean up the auth user if profile creation fails
        try {
          await fetch("/api/auth/delete-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: authData.user.id }),
          });
        } catch (deleteError) {
          console.error("Error calling delete user endpoint:", deleteError);
        }
        return { error: "Failed to create user profile. Please try again." };
      }

      console.log('Profile created successfully');
      return { error: null };
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      return { error: "An unexpected error occurred during sign up. Please try again." };
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ error: string | null }> {
    try {
      console.log('Starting signin process for:', email);
      
      // Validate inputs
      if (!email || !password) {
        return { error: "Email and password are required" };
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        return { error: "Please enter a valid email address" };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: "Invalid email or password. Please check your credentials and try again." };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: "Please check your email and click the confirmation link before signing in." };
        }
        if (error.message.includes('Too many requests')) {
          return { error: "Too many login attempts. Please wait a moment and try again." };
        }
        
        return { error: error.message };
      }

      if (!data.user) {
        console.error("No user returned from signin");
        return { error: "Sign in failed. Please try again." };
      }

      console.log('User signed in successfully:', data.user.id);

      // Verify profile exists
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: createError } = await supabase.from("profiles").insert([
            {
              id: data.user.id,
              name: data.user.user_metadata?.name || 'User',
              age: data.user.user_metadata?.age || 25,
              email: data.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          
          if (createError) {
            console.error("Error creating missing profile:", createError);
            await supabase.auth.signOut();
            return { error: "Account setup incomplete. Please contact support." };
          }
        } else {
          await supabase.auth.signOut();
          return { error: "Failed to load user profile. Please try again." };
        }
      }

      console.log('Profile verified successfully');
      return { error: null };
    } catch (err) {
      console.error("Unexpected error during signin:", err);
      return { error: "An unexpected error occurred during sign in. Please try again." };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      console.log('Starting signout process');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        return { error: error.message };
      }
      console.log('User signed out successfully');
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
        
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: createError } = await supabase.from("profiles").insert([
            {
              id: user.id,
              name: user.user_metadata?.name || 'User',
              age: user.user_metadata?.age || 25,
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          
          if (createError) {
            console.error("Error creating missing profile:", createError);
            return { user: null, error: "Failed to create user profile" };
          }
          
          // Return the created profile
          return {
            user: {
              id: user.id,
              email: user.email || "",
              name: user.user_metadata?.name || 'User',
              age: user.user_metadata?.age || 25,
              created_at: new Date().toISOString(),
            },
            error: null,
          };
        }
        
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
