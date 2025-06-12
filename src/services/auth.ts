
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/User';

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface UpdateProfileData {
  name: string;
  age: number;
}

class AuthService {
  async signUp(email: string, password: string, name: string, age: number): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            age,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Registration failed' };
      }

      // The trigger will automatically create the profile
      return { 
        user: {
          id: data.user.id,
          email: data.user.email!,
          name,
          age,
          created_at: new Date().toISOString(),
        }, 
        error: null 
      };
    } catch (err) {
      return { user: null, error: 'An unexpected error occurred during signup' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Authentication failed' };
      }

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { user: null, error: 'Failed to load user profile' };
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: profile.name,
          age: profile.age,
          created_at: profile.created_at,
        },
        error: null,
      };
    } catch (err) {
      return { user: null, error: 'An unexpected error occurred during signin' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err) {
      return { error: 'An unexpected error occurred during signout' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to load user profile:', error);
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: profile.name,
        age: profile.age,
        created_at: profile.created_at,
      };
    } catch (err) {
      console.error('Error getting current user:', err);
      return null;
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<{ error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          age: data.age,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return { error: error ? error.message : null };
    } catch (err) {
      return { error: 'An unexpected error occurred while updating profile' };
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
