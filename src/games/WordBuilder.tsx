import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import wordBuilderData from "@/data/wordBuilderWords.json";

interface WordData {
  word: string;
  hint: string;
}

interface LevelData {
  letters: string[];
  words: WordData[];
}

interface GameData {
  easy: LevelData[];
  medium: LevelData[];
  hard: LevelData[];
  expert: LevelData[];
}

const WordBuilder = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<keyof GameData>("easy");
  const [currentGameData, setCurrentGameData] = useState<LevelData | null>(null);
  const [selectedWord, setSelectedWord] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [usedLetters, setUsedLetters] = useState<number[]>([]);

  const data = wordBuilderData as GameData;

  // Initialize game with random data
  useEffect(() => {
    const getRandomGameData = () => {
      const levelData = data[currentLevel];
      const randomIndex = Math.floor(Math.random() * levelData.length);
      return levelData[randomIndex];
    };

    const newGameData = getRandomGameData();
    setCurrentGameData(newGameData);
    setFoundWords([]);
    setSelectedWord([]);
    setUsedLetters([]);
    setShowHints(false);
  }, [currentLevel, data]);

  const handleLetterClick = (letter: string, index: number) => {
    if (usedLetters.includes(index)) return;
    
    setSelectedWord([...selectedWord, letter]);
    setUsedLetters([...usedLetters, index]);
  };

  const handleClear = () => {
    setSelectedWord([]);
    setUsedLetters([]);
  };

  const handleSubmit = () => {
    if (!currentGameData) return;
    
    const word = selectedWord.join("");
    const validWord = currentGameData.words.find(w => w.word === word);
    
    if (validWord && !foundWords.includes(word)) {
      const points = word.length * 10;
      setScore(score + points);
      setFoundWords([...foundWords, word]);
      toast.success(`Great job! "${word}" found! +${points} points!`);
      
      // Check if all words are found
      if (foundWords.length + 1 === currentGameData.words.length) {
        toast.success("Amazing! You found all words! 🎉");
      }
    } else if (foundWords.includes(word)) {
      toast.info("You already found this word!");
    } else {
      toast.error("That's not a valid word. Try again!");
    }
    
    setSelectedWord([]);
    setUsedLetters([]);
  };

  const handleNewGame = () => {
    const getRandomGameData = () => {
      const levelData = data[currentLevel];
      const randomIndex = Math.floor(Math.random() * levelData.length);
      return levelData[randomIndex];
    };

    setCurrentGameData(getRandomGameData());
    setFoundWords([]);
    setSelectedWord([]);
    setUsedLetters([]);
    setShowHints(false);
  };

  const toggleHints = () => {
    setShowHints(!showHints);
  };

  const handleLevelChange = (level: keyof GameData) => {
    setCurrentLevel(level);
  };

  if (!currentGameData) {
    return <div>Loading...</div>;
  }

  const getRemainingWords = () => {
    return currentGameData.words.filter(word => !foundWords.includes(word.word));
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
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="text-2xl font-bold text-primary">
                Score: {score}
              </div>
              <div className="text-sm text-muted-foreground">
                Found: {foundWords.length}/{currentGameData.words.length}
              </div>
            </div>
          </div>

          {/* Level Selection */}
          <div className="flex justify-center gap-2 mb-4">
            {(Object.keys(data) as Array<keyof GameData>).map((level) => (
              <Button
                key={level}
                onClick={() => handleLevelChange(level)}
                variant={currentLevel === level ? "default" : "outline"}
                size="sm"
                className="capitalize"
              >
                {level}
              </Button>
            ))}
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

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {currentGameData.letters.map((letter, index) => (
                <Button
                  key={index}
                  onClick={() => handleLetterClick(letter, index)}
                  className={`h-16 text-xl font-bold ${
                    usedLetters.includes(index) 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "gradient-secondary hover:scale-105 transition-transform"
                  }`}
                  disabled={usedLetters.includes(index)}
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
              <Button
                onClick={handleNewGame}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </div>

            {/* Hint Section */}
            <div className="bg-accent/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Button
                  onClick={toggleHints}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  {showHints ? "Hide Hints" : "Show Hints"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {getRemainingWords().length} words remaining
                </div>
              </div>
              
              {showHints && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center mb-3">
                    💡 Hints for remaining words:
                  </p>
                  <div className="grid gap-2">
                    {getRemainingWords().map((wordData, index) => (
                      <div key={index} className="bg-background/50 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono">
                            {wordData.word.split('').map((_, i) => '●').join(' ')} 
                            <span className="text-xs text-muted-foreground ml-2">
                              ({wordData.word.length} letters)
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {wordData.hint}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {foundWords.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm font-medium text-center mb-2">
                    ✅ Found Words:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {foundWords.map((word, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default WordBuilder;