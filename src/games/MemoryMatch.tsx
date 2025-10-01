import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MemoryMatch = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"];

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    for (const index of seq) {
      setActiveButton(index);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setActiveButton(null);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    setIsPlaying(false);
  };

  const startGame = () => {
    const newSequence = [Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setScore(0);
    playSequence(newSequence);
  };

  const handleButtonClick = async (index: number) => {
    if (isPlaying) return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    setActiveButton(index);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setActiveButton(null);

    if (sequence[newPlayerSequence.length - 1] !== index) {
      toast.error("Wrong sequence! Game over!");
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 10;
      setScore(newScore);
      toast.success(`Correct! +10 points! Score: ${newScore}`);
      
      const newSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSequence);
      setPlayerSequence([]);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      playSequence(newSequence);
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

        <Card className="p-8 max-w-2xl mx-auto shadow-playful">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🧠</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Memory Match
            </h1>
            <p className="text-lg text-muted-foreground">
              Watch and repeat the sequence!
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(index)}
                  disabled={isPlaying}
                  className={`aspect-square rounded-lg ${color} ${
                    activeButton === index ? "opacity-100 scale-95" : "opacity-50"
                  } transition-all duration-200 hover:opacity-75 disabled:cursor-not-allowed`}
                />
              ))}
            </div>

            <Button
              onClick={startGame}
              className="w-full gradient-success h-14 text-lg"
            >
              {sequence.length === 0 ? "Start Game" : "Restart Game"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MemoryMatch;