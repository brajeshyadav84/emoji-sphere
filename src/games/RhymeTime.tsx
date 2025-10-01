import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RhymeTime = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState("CAT");

  const wordPairs = [
    { word: "CAT", rhymes: ["HAT", "BAT", "MAT"], nonRhymes: ["DOG", "SUN", "CAR"] },
    { word: "DOG", rhymes: ["LOG", "FOG", "HOG"], nonRhymes: ["CAT", "FAN", "TOP"] },
    { word: "SUN", rhymes: ["FUN", "RUN", "BUN"], nonRhymes: ["MOON", "STAR", "SKY"] },
    { word: "BEAR", rhymes: ["HAIR", "PAIR", "CHAIR"], nonRhymes: ["FISH", "BIRD", "LION"] },
  ];

  const [currentPair] = useState(wordPairs[0]);
  const [options, setOptions] = useState<string[]>([]);

  const generateOptions = () => {
    const allWords = [...currentPair.rhymes, ...currentPair.nonRhymes];
    const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, 4);
    setOptions(shuffled);
  };

  useState(() => {
    generateOptions();
  });

  const handleWordClick = (word: string) => {
    if (currentPair.rhymes.includes(word)) {
      setScore(score + 15);
      toast.success(`Yes! ${word} rhymes with ${currentWord}! +15 points!`);
      
      const nextPairIndex = (wordPairs.findIndex(p => p.word === currentWord) + 1) % wordPairs.length;
      const nextPair = wordPairs[nextPairIndex];
      setCurrentWord(nextPair.word);
      
      const allWords = [...nextPair.rhymes, ...nextPair.nonRhymes];
      const shuffled = allWords.sort(() => Math.random() - 0.5).slice(0, 4);
      setOptions(shuffled);
    } else {
      toast.error(`No, ${word} doesn't rhyme with ${currentWord}. Try again!`);
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
            <div className="text-6xl mb-4">🎵</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Rhyme Time
            </h1>
            <p className="text-lg text-muted-foreground">
              Find words that rhyme!
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-secondary/20 rounded-lg p-8 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                Which word rhymes with:
              </p>
              <div className="text-6xl font-bold text-primary">
                {currentWord}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((word, index) => (
                <Button
                  key={index}
                  onClick={() => handleWordClick(word)}
                  className="h-20 text-2xl font-bold gradient-secondary"
                >
                  {word}
                </Button>
              ))}
            </div>

            <div className="bg-accent/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Tip: Rhyming words sound similar at the end!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default RhymeTime;