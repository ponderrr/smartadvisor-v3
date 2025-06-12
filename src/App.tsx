
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ContentSelectionPage from "./pages/ContentSelectionPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import ResultsPage from "./pages/ResultsPage";
import AccountHistoryPage from "./pages/AccountHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-appPrimary flex items-center justify-center">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          user ? <Navigate to="/history" replace /> : <Index />
        } 
      />
      <Route 
        path="/auth" 
        element={
          user ? <Navigate to="/history" replace /> : <AuthPage />
        } 
      />
      
      {/* Protected Routes */}
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
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
