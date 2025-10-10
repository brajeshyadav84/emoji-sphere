import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import PostsFeed from "@/components/PostsFeed";
import TodaysChallenge from "@/components/TodaysChallenge";
import TopIdioms from "@/components/TopIdioms";
import HomeworkHelper from "@/components/HomeworkHelper";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
        <Hero />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
          <div className="lg:col-span-3 hidden lg:block">
            <Sidebar />
          </div>

          <div className="lg:col-span-6 space-y-3 md:space-y-6 min-w-0 w-full">
            <CreatePost />
            
            {/* Real posts from backend API */}
            <PostsFeed />
            
            
          </div>

          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <TodaysChallenge />
              
              <TopIdioms />

              <div className="bg-card p-4 rounded-2xl shadow-playful border-2 border-secondary/20">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  📝 Take an Exam
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Test your knowledge in different subjects!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors" onClick={() => navigate('/exam/math')}>
                    <span className="text-lg">🧮</span>
                    <span className="font-medium">Math Quiz</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors" onClick={() => navigate('/exam/science')}>
                    <span className="text-lg">🔬</span>
                    <span className="font-medium">Science Quiz</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors" onClick={() => navigate('/exam/english')}>
                    <span className="text-lg">📚</span>
                    <span className="font-medium">English Quiz</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-orange-50 hover:bg-orange-100 cursor-pointer transition-colors" onClick={() => navigate('/exam/puzzles')}>
                    <span className="text-lg">🧩</span>
                    <span className="font-medium">Puzzle Quiz</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 cursor-pointer transition-colors" onClick={() => navigate('/exam/ict')}>
                    <span className="text-lg">💻</span>
                    <span className="font-medium">ICT Quiz</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/exams')}
                  className="w-full mt-3 bg-gradient-to-r from-indigo-400 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  View All Exams
                </button>
              </div>

              {/* <div className="bg-card p-4 rounded-2xl shadow-playful border-2 border-secondary/20">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  🏆 Top Contributors
                </h3>
                <div className="space-y-2">
                  {["🥇", "🥈", "🥉"].map((medal, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-xl">{medal}</span>
                      <span className="font-medium">Amazing Kid {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </main>
      
      {/* Homework Helper Component */}
      <HomeworkHelper />
    </div>
  );
};

export default Index;
