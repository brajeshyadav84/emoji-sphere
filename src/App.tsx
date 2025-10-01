import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Groups from "./pages/Groups";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

// Game imports
import WordBuilder from "./games/WordBuilder";
import MathQuest from "./games/MathQuest";
import ColorMatch from "./games/ColorMatch";
import AnimalQuiz from "./games/AnimalQuiz";
import MemoryMatch from "./games/MemoryMatch";
import PuzzleGame from "./games/PuzzleGame";
import ShapeSorter from "./games/ShapeSorter";
import NumberRace from "./games/NumberRace";
import DrawingBoard from "./games/DrawingBoard";
import RhymeTime from "./games/RhymeTime";

// Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import GroupManagement from "./pages/admin/GroupManagement";
import QuizManagement from "./pages/admin/QuizManagement";
import ChallengeManagement from "./pages/admin/ChallengeManagement";
import HolidayAssignments from "./pages/admin/HolidayAssignments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<Games />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/chat" element={<Chat />} />
          
          {/* Game routes */}
          <Route path="/games/word-builder" element={<WordBuilder />} />
          <Route path="/games/math-quest" element={<MathQuest />} />
          <Route path="/games/color-match" element={<ColorMatch />} />
          <Route path="/games/animal-quiz" element={<AnimalQuiz />} />
          <Route path="/games/memory-match" element={<MemoryMatch />} />
          <Route path="/games/puzzle-game" element={<PuzzleGame />} />
          <Route path="/games/shape-sorter" element={<ShapeSorter />} />
          <Route path="/games/number-race" element={<NumberRace />} />
          <Route path="/games/drawing-board" element={<DrawingBoard />} />
          <Route path="/games/rhyme-time" element={<RhymeTime />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/groups" element={<GroupManagement />} />
          <Route path="/admin/quizzes" element={<QuizManagement />} />
          <Route path="/admin/challenges" element={<ChallengeManagement />} />
          <Route path="/admin/assignments" element={<HolidayAssignments />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
