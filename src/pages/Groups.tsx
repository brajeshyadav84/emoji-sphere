import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Lock, Globe, Settings } from "lucide-react";

const Groups = () => {
  const navigate = useNavigate();
  
  const myGroups = [
    {
      id: 1,
      name: "Art Lovers",
      emoji: "🎨",
      members: 45,
      type: "public",
      description: "Share your amazing artwork and get inspired!",
    },
    {
      id: 2,
      name: "Science Squad",
      emoji: "🔬",
      members: 38,
      type: "public",
      description: "Explore the wonders of science together!",
    },
    {
      id: 3,
      name: "Music Band",
      emoji: "🎵",
      members: 52,
      type: "private",
      description: "For music lovers and instrument learners!",
    },
  ];

  const suggestedGroups = [
    {
      id: 4,
      name: "Book Club",
      emoji: "📚",
      members: 67,
      type: "public",
      description: "Read and discuss amazing books!",
    },
    {
      id: 5,
      name: "Game Masters",
      emoji: "🎮",
      members: 89,
      type: "public",
      description: "Play games and share tips!",
    },
    {
      id: 6,
      name: "Nature Explorers",
      emoji: "🌿",
      members: 41,
      type: "public",
      description: "Learn about plants and animals!",
    },
    {
      id: 7,
      name: "Sports Stars",
      emoji: "⚽",
      members: 73,
      type: "public",
      description: "Talk about your favorite sports!",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
              <span className="gradient-text-primary">My Groups</span> 👥
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Join groups and connect with friends who share your interests!
            </p>
        </div>
        
        <section className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Your Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {myGroups.map((group) => (
              <Card
                key={group.id}
                className="p-4 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 w-full max-w-full"
              >
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="text-3xl md:text-5xl">{group.emoji}</div>
                  {group.type === "private" ? (
                    <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  )}
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-2">{group.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{group.description}</p>

                <div className="flex items-center gap-2 mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{group.members} members</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    View Group
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/groups/${group.id}/members`)}
                    title="Manage Members"
                    className="h-8 w-8 md:h-10 md:w-10"
                  >
                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Suggested Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {suggestedGroups.map((group) => (
              <Card
                key={group.id}
                className="p-4 md:p-6 shadow-playful hover:shadow-hover transition-all duration-300 w-full max-w-full"
              >
                <div className="text-3xl md:text-5xl mb-3 text-center">{group.emoji}</div>

                <h3 className="text-base md:text-lg font-bold mb-2 text-center">{group.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 text-center line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-center gap-2 mb-3 md:mb-4 text-xs md:text-sm text-muted-foreground">
                  <Users className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{group.members}</span>
                </div>

                <Button className="w-full gradient-primary font-semibold text-xs md:text-sm py-1.5 md:py-2">
                  Join Group
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Groups;
