import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WordBuilder = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentLetters, setCurrentLetters] = useState(["C", "A", "T", "S"]);
  const [selectedWord, setSelectedWord] = useState<string[]>([]);

  const validWords = ["CAT", "CATS", "SAT", "ACT", "CAST"];

  const handleLetterClick = (letter: string, index: number) => {
    setSelectedWord([...selectedWord, letter]);
  };

  const handleClear = () => {
    setSelectedWord([]);
  };

  const handleSubmit = () => {
    const word = selectedWord.join("");
    if (validWords.includes(word)) {
      setScore(score + word.length * 10);
      toast.success(`Great job! +${word.length * 10} points!`);
      setSelectedWord([]);
    } else {
      toast.error("That's not a valid word. Try again!");
      setSelectedWord([]);
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
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text-primary">Word Builder</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Make words from the letters below!
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/20 rounded-lg p-4 min-h-[80px] flex items-center justify-center gap-2 flex-wrap">
              {selectedWord.length === 0 ? (
                <p className="text-muted-foreground">Click letters to build a word</p>
              ) : (
                selectedWord.map((letter, index) => (
                  <div
                    key={index}
                    className="w-14 h-14 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-2xl font-bold shadow-md"
                  >
                    {letter}
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {currentLetters.map((letter, index) => (
                <Button
                  key={index}
                  onClick={() => handleLetterClick(letter, index)}
                  className="h-20 text-2xl font-bold gradient-secondary"
                >
                  {letter}
                </Button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 gradient-success"
                disabled={selectedWord.length === 0}
              >
                Submit Word
              </Button>
            </div>

            <div className="bg-accent/20 rounded-lg p-4">
              <p className="text-sm text-center text-muted-foreground">
                Try making: CAT, CATS, SAT, ACT, CAST
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default WordBuilder;