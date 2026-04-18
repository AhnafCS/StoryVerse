// @ts-nocheck
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import Index from "./pages/Index";
import HomeFeed from "./pages/HomeFeed";
import UserProfile from "./pages/UserProfile";
import CharacterPsychology from "./pages/CharacterPsychology";
import TheoryForum from "./pages/TheoryForum";
import PersonalAnalytics from "./pages/PersonalAnalytics";
import NarrativeViz from "./pages/NarrativeViz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/feed" element={<HomeFeed />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/psychology" element={<CharacterPsychology />} />
            <Route path="/forum" element={<TheoryForum />} />
            <Route path="/analytics" element={<PersonalAnalytics />} />
            <Route path="/narrative" element={<NarrativeViz />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
