// @ts-nocheck
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { useEffect } from "react";
import Index from "./pages/Index";
import HomeFeed from './pages/HomeFeed';
import UserProfile from './pages/UserProfile';
import ViewProfile from './pages/ViewProfile';
import CharacterPsychology from "./pages/CharacterPsychology";
import TheoryForum from "./pages/TheoryForum";
import PersonalAnalytics from "./pages/PersonalAnalytics";
import NarrativeViz from "./pages/NarrativeViz";
import NotFound from "./pages/NotFound";
import { api } from "./lib/api";

const queryClient = new QueryClient();

// URL for pinging the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AppContent = () => {
  // Keep-alive ping to prevent Render's free tier from spinning down the server
  // while the user has the app open. Render spins down after 15 mins of inactivity.
  useEffect(() => {
    const pingServer = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/health`);
      } catch (error) {
        console.error('Keep-alive ping failed:', error);
      }
    };

    // Ping every 10 minutes (600,000 milliseconds)
    const intervalId = setInterval(pingServer, 10 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/feed" element={<HomeFeed />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/profile/:username" element={<ViewProfile />} />
      <Route path="/psychology" element={<CharacterPsychology />} />
      <Route path="/forum" element={<TheoryForum />} />
      <Route path="/analytics" element={<PersonalAnalytics />} />
      <Route path="/narrative" element={<NarrativeViz />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
