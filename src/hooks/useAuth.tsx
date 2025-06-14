
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/User";
import { authService } from "@/services/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    age: number
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (
    name: string,
    age: number
  ) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        setError(null);

        // Set up auth state listener first
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (!mounted) return;

          setSession(session);

          if (session?.user) {
            // Load user profile when we have a session
            try {
              const { user: profileUser, error: profileError } = await authService.getCurrentUser();
              if (profileError) {
                console.error('Error loading user profile:', profileError);
                setError(profileError);
                setUser(null);
              } else {
                setUser(profileUser);
              }
            } catch (err) {
              console.error('Unexpected error loading profile:', err);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          
          setLoading(false);
        });

        // Check for existing session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (sessionError) {
          console.error("Error getting initial session:", sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }

        console.log('Initial session:', initialSession?.user?.id || 'none');

        // The onAuthStateChange listener will handle the session
        if (!initialSession) {
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Unexpected error during initial auth setup:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during auth initialization";
        setError(errorMessage);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting signin...');
      
      const result = await authService.signIn(email, password);
      
      if (result.error) {
        setError(result.error);
        console.error('Signin failed:', result.error);
      } else {
        console.log('Signin successful');
        // Auth state change will be handled by the listener
      }
      
      return result;
    } catch (error) {
      console.error("Error signing in:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    age: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting signup...');
      
      const result = await authService.signUp(email, password, name, age);
      
      if (result.error) {
        setError(result.error);
        console.error('Signup failed:', result.error);
      } else {
        console.log('Signup successful');
        // Auth state change will be handled by the listener
      }
      
      return result;
    } catch (error) {
      console.error("Error signing up:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting signout...');
      
      const result = await authService.signOut();
      
      if (result.error) {
        setError(result.error);
        console.error('Signout failed:', result.error);
      } else {
        console.log('Signout successful');
        setUser(null);
        setSession(null);
      }
      
      return result;
    } catch (error) {
      console.error("Error signing out:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (name: string, age: number) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error("No user logged in");
      }

      const result = await authService.updateProfile({ name, age });

      if (result.error) {
        setError(result.error);
      } else {
        setUser({ ...user, name, age });
      }

      return result;
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
