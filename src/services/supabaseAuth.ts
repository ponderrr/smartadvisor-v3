
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  age: number;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  age?: number;
  isSignUp: boolean;
}

class SupabaseAuthService {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Authentication failed');
    }

    // Get user profile from our profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to load user profile');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name: profile.name,
      age: profile.age,
    };
  }

  async signUp(email: string, password: string, name: string, age: number): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          age,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      name,
      age,
    };
  }

  async authenticate(authData: AuthFormData): Promise<AuthUser> {
    if (authData.isSignUp) {
      if (!authData.name || !authData.age) {
        throw new Error('Name and age are required for sign up');
      }
      return this.signUp(authData.email, authData.password, authData.name, authData.age);
    } else {
      return this.signIn(authData.email, authData.password);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Get user profile from our profiles table
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
    };
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
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

export const authService = new SupabaseAuthService();
