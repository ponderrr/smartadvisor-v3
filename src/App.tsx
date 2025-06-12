
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

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/content-selection" replace /> : <AuthPage />} 
      />
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
