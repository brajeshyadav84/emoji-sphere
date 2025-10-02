import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import TodaysChallenge from "@/components/TodaysChallenge";

const Index = () => {
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
              <PostCard key={index} {...post} />
            ))}
          </div>

          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <TodaysChallenge />

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
