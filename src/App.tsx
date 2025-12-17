import { Toaster } from "@/components/ui/toaster";
import ICTExam from './pages/exam/ICTExam';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "@/store/authSlice";
import useSecurity from "@/hooks/useSecurity";
import { initBodyMarginFix, cleanupBodyMarginFix } from "@/utils/bodyMarginFix";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Groups from "./pages/Groups";
import GroupManagement from "./pages/GroupManagement";
import GroupMembers from "./pages/GroupMembers";
import GroupPage from "./pages/GroupPage";
import Chat from "./pages/Chat";
import Idioms from "./pages/Idioms";
import Exams from "./pages/Exams";
import AskMe from "./pages/AskMe";
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
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import TeacherLogin from "./pages/auth/TeacherLogin";
import TeacherRegister from "./pages/auth/TeacherRegister";

// User imports
import Dashboard from "./pages/users/Dashboard";
import UserInfo from "./pages/UserInfo";
import ApiTest from "./pages/ApiTest";

// Teacher imports
import TeacherDashboard from "./pages/teachers/TeacherDashboard";
import TeacherMeetings from "./pages/teachers/TeacherMeetings";
import TeachersDetails from "./pages/teachers/TeachersDetails";
import Tutors from "./pages/Tutors";

// Knowledge imports
import Planets from "./pages/knowledge/Planets";
import Shape from "./pages/knowledge/Shape";
import Measurement from "./pages/knowledge/Measurement.tsx";

// Game imports
import WordBuilder from "./games/WordBuilder";
import MathQuest from "./games/MathQuest";
import ColorMatch from "./games/ColorMatch";
import AnimalQuiz from "./games/AnimalQuiz";
import Alphabet from "./games/Alphabet";
import HindiAlphabet from "./games/HindiAlphabet";
import MemoryMatch from "./games/MemoryMatch";
import PuzzleGame from "./games/PuzzleGame";
import ShapeSorter from "./games/ShapeSorter";
import NumberRace from "./games/NumberRace";
import DrawingBoard from "./games/DrawingBoard";
import RhymeTime from "./games/RhymeTime";

// Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import QuizManagement from "./pages/admin/QuizManagement";
import QuestionManagement from "./pages/admin/QuestionManagement";
import ChallengeManagement from "./pages/admin/ChallengeManagement";
import HolidayAssignments from "./pages/admin/HolidayAssignments";
import ZoomPortalManager from "./pages/admin/ZoomPortalManager";

// Online Meeting imports
import OnlineMeeting from "./pages/OnlineMeetingSimple";
import MeetingRoom from "./pages/MeetingRoom";

const queryClient = new QueryClient();

const App = () => {
  const dispatch = useDispatch();
  
  // Apply security features globally
  useSecurity();
  
  // Load user from localStorage on app startup
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);
  
  // Initialize body margin fix to prevent dropdown/modal scroll issues
  useEffect(() => {
    initBodyMarginFix();
    
    return () => {
      cleanupBodyMarginFix();
    };
  }, []);
  
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
          <Route path="/groups/manage" element={
            <ProtectedRoute>
              <GroupManagement />
            </ProtectedRoute>
          } />
          <Route path="/groups/:groupId" element={<GroupPage />} />
          <Route path="/groups/:groupId/members" element={<GroupMembers />} />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/idioms" element={<Idioms />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/ask-me" element={<AskMe />} />
          <Route path="/onlineclasses" element={<OnlineMeeting />} />
          <Route path="/meeting-room" element={<MeetingRoom />} />
          
          {/* Knowledge routes */}
          <Route path="/knowledge/planets" element={<Planets />} />
          <Route path="/knowledge/shapes" element={<Shape />} />
          <Route path="/knowledge/measurement" element={<Measurement />} />
          
          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/admin-login" element={<AdminLogin />} />
          <Route path="/auth/emoji-register" element={<AdminRegister />} />
          <Route path="/auth/teacher-login" element={<TeacherLogin />} />
          <Route path="/auth/teacher-register" element={<TeacherRegister />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verify-otp" element={<VerifyOTP />} />
          
          {/* User routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/teachers" element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teachers/meetings" element={
            <ProtectedRoute>
              <TeacherMeetings />
            </ProtectedRoute>
          } />
          <Route path="/teachers/details" element={
            <ProtectedRoute>
              <TeachersDetails />
            </ProtectedRoute>
          } />
          <Route path="/tutors" element={<Tutors />} />
          <Route path="/user/:userId" element={<UserInfo />} />
          <Route path="/api-test" element={<ApiTest />} />
          
          {/* Game routes */}
          <Route path="/games/word-builder" element={<WordBuilder />} />
          <Route path="/games/math-quest" element={<MathQuest />} />
          <Route path="/games/color-match" element={<ColorMatch />} />
          <Route path="/games/animal-quiz" element={<AnimalQuiz />} />
          <Route path="/games/alphabet" element={<Alphabet />} />
          <Route path="/games/hindi-alphabet" element={<HindiAlphabet />} />
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
          <Route path="/exam/ict" element={<ICTExam />} />
          
          {/* Admin routes - Protected with AdminRoute */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/groups" element={
            <AdminRoute>
              <GroupManagement />
            </AdminRoute>
          } />
          <Route path="/admin/groups/:groupId/members" element={
            <AdminRoute>
              <GroupMembers />
            </AdminRoute>
          } />
          <Route path="/admin/quizzes" element={
            <AdminRoute>
              <QuizManagement />
            </AdminRoute>
          } />
          <Route path="/admin/questions" element={
            <AdminRoute>
              <QuestionManagement />
            </AdminRoute>
          } />
          <Route path="/admin/challenges" element={
            <AdminRoute>
              <ChallengeManagement />
            </AdminRoute>
          } />
          <Route path="/admin/assignments" element={
            <AdminRoute>
              <HolidayAssignments />
            </AdminRoute>
          } />
          <Route path="/zoom-portal" element={
            <AdminRoute>
              <ZoomPortalManager />
            </AdminRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
