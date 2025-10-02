import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Games = () => {
  const navigate = useNavigate();
  const games = [
    {
      id: 1,
      title: "Word Builder",
      emoji: "📝",
      description: "Create words and expand your vocabulary!",
      players: 234,
      rating: 5,
      path: "/games/word-builder",
    },
    {
      id: 2,
      title: "Math Quest",
      emoji: "🔢",
      description: "Solve puzzles and become a math hero!",
      players: 456,
      rating: 5,
      path: "/games/math-quest",
    },
    {
      id: 3,
      title: "Color Match",
      emoji: "🎨",
      description: "Match colors and train your memory!",
      players: 189,
      rating: 4,
      path: "/games/color-match",
    },
    {
      id: 4,
      title: "Animal Quiz",
      emoji: "🦁",
      description: "Learn fun facts about animals!",
      players: 312,
      rating: 5,
      path: "/games/animal-quiz",
    },
    {
      id: 5,
      title: "Memory Match",
      emoji: "🧠",
      description: "Test your memory with this classic game!",
      players: 278,
      rating: 4,
      path: "/games/memory-match",
    },
    {
      id: 6,
      title: "Puzzle Game",
      emoji: "🧩",
      description: "Solve sliding puzzles!",
      players: 401,
      rating: 5,
      path: "/games/puzzle-game",
    },
    {
      id: 7,
      title: "Shape Sorter",
      emoji: "🔷",
      description: "Match the shapes correctly!",
      players: 345,
      rating: 5,
      path: "/games/shape-sorter",
    },
    {
      id: 8,
      title: "Number Race",
      emoji: "🔢",
      description: "Race against time to find numbers!",
      players: 289,
      rating: 4,
      path: "/games/number-race",
    },
    {
      id: 9,
      title: "Drawing Board",
      emoji: "🎨",
      description: "Create your own masterpieces!",
      players: 512,
      rating: 5,
      path: "/games/drawing-board",
    },
    {
      id: 10,
      title: "Rhyme Time",
      emoji: "🎵",
      description: "Learn words that rhyme!",
      players: 423,
      rating: 5,
      path: "/games/rhyme-time",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text-primary">Fun Games!</span> 🎮
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

              <Button 
                className="w-full gradient-primary font-semibold gap-2"
                onClick={() => navigate(game.path)}
              >
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
