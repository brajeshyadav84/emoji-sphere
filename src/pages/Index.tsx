import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import TodaysChallenge from "@/components/TodaysChallenge";
import TopIdioms from "@/components/TopIdioms";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const samplePosts = [
    {
      author: "Alex the Artist",
      avatar: "🎨",
      time: "2 hours ago",
      content: "Just finished my rainbow painting! 🌈 It has all my favorite colors. What's your favorite color? 💜💙💚💛🧡❤️",
      likes: 24,
      comments: 8,
    },
    {
      author: "Music Maker Maya",
      avatar: "🎵",
      time: "5 hours ago",
      content: "Learning to play a new song on my keyboard today! Practice makes perfect! 🎹✨ Anyone else learning an instrument?",
      likes: 18,
      comments: 5,
    },
    {
      author: "Science Sam",
      avatar: "🔬",
      time: "1 day ago",
      content: "Did you know butterflies can taste with their feet?! 🦋 Science is so cool! What's your favorite science fact?",
      likes: 42,
      comments: 12,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Hero />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 hidden lg:block">
            <Sidebar />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <CreatePost />
            
            {samplePosts.map((post, index) => (
              <PostCard key={index} postId={`sample-${index}`} {...post} />
            ))}
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
                </div>
                <button
                  onClick={() => navigate('/exams')}
                  className="w-full mt-3 bg-gradient-to-r from-indigo-400 to-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  View All Exams
                </button>
              </div>

              <div className="bg-card p-4 rounded-2xl shadow-playful border-2 border-secondary/20">
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
