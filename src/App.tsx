import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useSecurity from "@/hooks/useSecurity";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Groups from "./pages/Groups";
import GroupMembers from "./pages/GroupMembers";
import Chat from "./pages/Chat";
import Idioms from "./pages/Idioms";
import Exams from "./pages/Exams";
import NotFound from "./pages/NotFound";

// Exam imports
import MathExam from "./pages/exam/MathExam";
import ScienceExam from "./pages/exam/ScienceExam";
import EnglishExam from "./pages/exam/EnglishExam";
import PuzzleExam from "./pages/exam/PuzzleExam";

// Auth imports
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";

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
import QuestionManagement from "./pages/admin/QuestionManagement";
import ChallengeManagement from "./pages/admin/ChallengeManagement";
import HolidayAssignments from "./pages/admin/HolidayAssignments";

const queryClient = new QueryClient();

const App = () => {
  // Apply security features globally
  useSecurity();
  
  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<Games />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:groupId/members" element={<GroupMembers />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/idioms" element={<Idioms />} />
          <Route path="/exams" element={<Exams />} />
          
          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          
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
          
          {/* Exam routes */}
          <Route path="/exam/math" element={<MathExam />} />
          <Route path="/exam/science" element={<ScienceExam />} />
          <Route path="/exam/english" element={<EnglishExam />} />
          <Route path="/exam/puzzles" element={<PuzzleExam />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/groups" element={<GroupManagement />} />
          <Route path="/admin/groups/:groupId/members" element={<GroupMembers />} />
          <Route path="/admin/quizzes" element={<QuizManagement />} />
          <Route path="/admin/questions" element={<QuestionManagement />} />
          <Route path="/admin/challenges" element={<ChallengeManagement />} />
          <Route path="/admin/assignments" element={<HolidayAssignments />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
