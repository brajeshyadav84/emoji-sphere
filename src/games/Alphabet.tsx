import { useState, useRef } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Alphabet = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showAnimal, setShowAnimal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Alphabet with corresponding animals and sounds
  const alphabetAnimals = {
    A: { animal: "Ant", emoji: "🐜", sound: "A for Ant" },
    B: { animal: "Bear", emoji: "🐻", sound: "B for Bear" },
    C: { animal: "Cat", emoji: "🐱", sound: "C for Cat" },
    D: { animal: "Dog", emoji: "🐕", sound: "D for Dog" },
    E: { animal: "Elephant", emoji: "🐘", sound: "E for Elephant" },
    F: { animal: "Fish", emoji: "🐠", sound: "F for Fish" },
    G: { animal: "Giraffe", emoji: "🦒", sound: "G for Giraffe" },
    H: { animal: "Horse", emoji: "🐴", sound: "H for Horse" },
    I: { animal: "Iguana", emoji: "🦎", sound: "I for Iguana" },
    J: { animal: "Jellyfish", emoji: "🪼", sound: "J for Jellyfish" },
    K: { animal: "Kangaroo", emoji: "🦘", sound: "K for Kangaroo" },
    L: { animal: "Lion", emoji: "🦁", sound: "L for Lion" },
    M: { animal: "Monkey", emoji: "🐵", sound: "M for Monkey" },
    N: { animal: "Narwhal", emoji: "🐋", sound: "N for Narwhal" },
    O: { animal: "Owl", emoji: "🦉", sound: "O for Owl" },
    P: { animal: "Penguin", emoji: "🐧", sound: "P for Penguin" },
    Q: { animal: "Quail", emoji: "🐦", sound: "Q for Quail" },
    R: { animal: "Rabbit", emoji: "🐰", sound: "R for Rabbit" },
    S: { animal: "Snake", emoji: "🐍", sound: "S for Snake" },
    T: { animal: "Tiger", emoji: "🐅", sound: "T for Tiger" },
    U: { animal: "Unicorn", emoji: "🦄", sound: "U for Unicorn" },
    V: { animal: "Vulture", emoji: "🦅", sound: "V for Vulture" },
    W: { animal: "Whale", emoji: "🐳", sound: "W for Whale" },
    X: { animal: "X-ray Fish", emoji: "🐟", sound: "X for X-ray Fish" },
    Y: { animal: "Yak", emoji: "🐂", sound: "Y for Yak" },
    Z: { animal: "Zebra", emoji: "🦓", sound: "Z for Zebra" },
  };

  const speakText = (text: string) => {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    // Try to find a child-friendly voice
    const voices = speechSynthesis.getVoices();
    const childVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Female') || 
      voice.name.includes('Microsoft')
    );
    
    if (childVoice) {
      utterance.voice = childVoice;
    }
    
    speechSynthesis.speak(utterance);
    toast.success(`🔊 ${text}`);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setShowAnimal(true);
    
    // Speak the letter and animal
    const animalData = alphabetAnimals[letter as keyof typeof alphabetAnimals];
    speakText(animalData.sound);
    
    // Hide the animal after 3 seconds
    setTimeout(() => {
      setShowAnimal(false);
    }, 3000);
  };

  const speakAlphabet = () => {
    speakText("A B C D E F G H I J K L M N O P Q R S T U V W X Y Z");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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

        <Card className="p-8 mx-auto shadow-playful">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text-primary">🔤 Alphabet Animals</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Click on any letter to see an animal and hear the sound!
            </p>
            <Button 
              onClick={speakAlphabet}
              className="gap-2 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
            >
              <Volume2 className="h-4 w-4" />
              Sing the Alphabet
            </Button>
          </div>

          {/* Selected Letter and Animal Display */}
          {selectedLetter && showAnimal && (
            <div className="mb-8 text-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 border-4 border-yellow-300 animate-bounce">
              <div className="text-8xl mb-4">
                {alphabetAnimals[selectedLetter as keyof typeof alphabetAnimals].emoji}
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                {selectedLetter} is for {alphabetAnimals[selectedLetter as keyof typeof alphabetAnimals].animal}
              </h2>
              <p className="text-2xl text-gray-600">
                🔊 {alphabetAnimals[selectedLetter as keyof typeof alphabetAnimals].sound}
              </p>
            </div>
          )}

          {/* Alphabet Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mb-6">
            {Object.keys(alphabetAnimals).map((letter) => (
              <Button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`h-16 w-16 text-2xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  selectedLetter === letter 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg scale-110' 
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white'
                }`}
              >
                {letter}
              </Button>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-center bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              🎯 How to Play
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-blue-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👆</span>
                <span>Click any letter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐻</span>
                <span>See the animal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔊</span>
                <span>Hear the sound</span>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Alphabet;