import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Star, Users } from "lucide-react";

const Games = () => {
  const games = [
    {
      id: 1,
      title: "Word Builder",
      emoji: "📝",
      description: "Create words and expand your vocabulary!",
      players: 234,
      rating: 5,
    },
    {
      id: 2,
      title: "Math Quest",
      emoji: "🔢",
      description: "Solve puzzles and become a math hero!",
      players: 456,
      rating: 5,
    },
    {
      id: 3,
      title: "Color Match",
      emoji: "🎨",
      description: "Match colors and train your memory!",
      players: 189,
      rating: 4,
    },
    {
      id: 4,
      title: "Animal Quiz",
      emoji: "🦁",
      description: "Learn fun facts about animals!",
      players: 312,
      rating: 5,
    },
    {
      id: 5,
      title: "Music Maker",
      emoji: "🎵",
      description: "Create your own tunes and melodies!",
      players: 278,
      rating: 4,
    },
    {
      id: 6,
      title: "Story Time",
      emoji: "📚",
      description: "Read and create amazing stories!",
      players: 401,
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
            Fun Games! 🎮
          </h1>
          <p className="text-lg text-muted-foreground">
            Play educational games and have fun while learning!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="p-6 shadow-playful hover:shadow-hover transition-all duration-300 hover:scale-105"
            >
              <div className="text-6xl mb-4 text-center">{game.emoji}</div>
              
              <h3 className="text-xl font-bold mb-2 text-center">{game.title}</h3>
              
              <p className="text-sm text-muted-foreground mb-4 text-center">
                {game.description}
              </p>

              <div className="flex items-center justify-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span>{game.rating}/5</span>
                </div>
              </div>

              <Button className="w-full gradient-primary font-semibold gap-2">
                <Play className="h-4 w-4" />
                Play Now
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="p-8 gradient-success text-success-foreground text-center">
            <h2 className="text-2xl font-bold mb-2">Coming Soon! 🚀</h2>
            <p className="text-lg opacity-90">
              More awesome games are being created just for you! Stay tuned! ✨
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Games;
