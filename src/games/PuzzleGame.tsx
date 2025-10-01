import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shuffle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PuzzleGame = () => {
  const navigate = useNavigate();
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);

  const shufflePuzzle = () => {
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setTiles(shuffled);
    setMoves(0);
  };

  const handleTileClick = (index: number) => {
    const emptyIndex = tiles.indexOf(0);
    const validMoves = [
      emptyIndex - 1,
      emptyIndex + 1,
      emptyIndex - 3,
      emptyIndex + 3,
    ];

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [
        newTiles[emptyIndex],
        newTiles[index],
      ];
      setTiles(newTiles);
      setMoves(moves + 1);

      if (newTiles.join("") === "123456780") {
        toast.success(`You won in ${moves + 1} moves!`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Button
          onClick={() => navigate("/games")}
          variant="ghost"
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>

        <Card className="p-8 max-w-md mx-auto shadow-playful">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🧩</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Puzzle Game
            </h1>
            <p className="text-lg text-muted-foreground">
              Arrange numbers 1-8!
            </p>
            <div className="mt-4 text-xl font-bold text-primary">
              Moves: {moves}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2 bg-secondary/20 p-4 rounded-lg">
              {tiles.map((tile, index) => (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`aspect-square rounded-lg text-3xl font-bold transition-all ${
                    tile === 0
                      ? "bg-transparent cursor-default"
                      : "bg-primary text-primary-foreground hover:scale-95"
                  }`}
                  disabled={tile === 0}
                >
                  {tile !== 0 ? tile : ""}
                </button>
              ))}
            </div>

            <Button
              onClick={shufflePuzzle}
              className="w-full gradient-secondary gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PuzzleGame;