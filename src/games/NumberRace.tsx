import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const NumberRace = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const startGame = () => {
    const shuffledNumbers = Array.from({ length: 20 }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    );
    setNumbers(shuffledNumbers);
    setTargetNumber(1);
    setTimeLeft(30);
    setScore(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      toast.success(`Time's up! Final score: ${score}`);
    }
  }, [timeLeft, isPlaying]);

  const handleNumberClick = (number: number) => {
    if (!isPlaying) return;

    if (number === targetNumber) {
      setScore(score + 10);
      setTargetNumber(targetNumber + 1);
      toast.success(`Correct! Find ${targetNumber + 1}`);

      if (targetNumber === 20) {
        setIsPlaying(false);
        toast.success(`You win! Final score: ${score + 10}`);
      }
    } else {
      toast.error("Wrong number!");
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
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🔢</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Number Race
            </h1>
            <p className="text-lg text-muted-foreground">
              Click numbers 1-20 in order!
            </p>
            <div className="mt-4 flex justify-center gap-8">
              <div className="text-2xl font-bold text-primary">
                Score: {score}
              </div>
              <div className="text-2xl font-bold text-secondary">
                Time: {timeLeft}s
              </div>
            </div>
            <div className="mt-2 text-xl text-muted-foreground">
              Find: <span className="font-bold text-primary">{targetNumber}</span>
            </div>
          </div>

          <div className="space-y-6">
            {!isPlaying ? (
              <Button
                onClick={startGame}
                className="w-full h-14 text-xl gradient-success"
              >
                Start Race!
              </Button>
            ) : null}

            <div className="grid grid-cols-5 gap-3">
              {numbers.map((number, index) => (
                <Button
                  key={index}
                  onClick={() => handleNumberClick(number)}
                  disabled={!isPlaying || number < targetNumber}
                  className={`aspect-square text-2xl font-bold ${
                    number < targetNumber
                      ? "bg-success/50"
                      : "gradient-secondary"
                  }`}
                >
                  {number}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default NumberRace;