
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { validateEnvironment } from "@/utils/envValidation";
import { useEffect } from "react";

import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import ContentSelectionPage from "@/pages/ContentSelectionPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import ResultsPage from "@/pages/ResultsPage";
import AccountHistoryPage from "@/pages/AccountHistoryPage";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Validate required environment variables
    const requiredEnvVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    };

    const missing = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing);
      if (import.meta.env.DEV) {
        console.error('Please add these variables to your .env file:');
        missing.forEach(key => console.error(`- ${key}`));
      }
    } else {
      console.log('All required environment variables are configured');
    }

    // Additional validation
    const validation = validateEnvironment();
    if (!validation.isValid && import.meta.env.DEV) {
      console.warn('Some optional environment variables are missing:', validation.missingKeys);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/content-selection"
                element={
                  <ProtectedRoute>
                    <ContentSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questionnaire"
                element={
                  <ProtectedRoute>
                    <QuestionnairePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <AccountHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
