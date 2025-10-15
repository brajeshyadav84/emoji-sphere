import { useState, useRef } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HindiAlphabet = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showWord, setShowWord] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hindi consonants with corresponding words and sounds
  const hindiConsonants = {
    क: { word: "कमल", emoji: "🪷", sound: "क से कमल", english: "Ka se Kamal" },
    ख: { word: "खरगोश", emoji: "🐰", sound: "ख से खरगोश", english: "Kha se Khargosh" },
    ग: { word: "गाय", emoji: "🐄", sound: "ग से गाय", english: "Ga se Gaay" },
    घ: { word: "घड़ी", emoji: "⏰", sound: "घ से घड़ी", english: "Gha se Ghadi" },
    च: { word: "चाँद", emoji: "🌙", sound: "च से चाँद", english: "Cha se Chaand" },
    छ: { word: "छतरी", emoji: "☂️", sound: "छ से छतरी", english: "Chha se Chhatri" },
    ज: { word: "जहाज़", emoji: "✈️", sound: "ज से जहाज़", english: "Ja se Jahaaz" },
    झ: { word: "झंडा", emoji: "🚩", sound: "झ से झंडा", english: "Jha se Jhanda" },
    ट: { word: "टमाटर", emoji: "🍅", sound: "ट से टमाटर", english: "Ta se Tamatar" },
    ठ: { word: "ठठेरा", emoji: "🔨", sound: "ठ से ठठेरा", english: "Tha se Thathera" },
    ड: { word: "डमरू", emoji: "🥁", sound: "ड से डमरू", english: "Da se Damru" },
    ढ: { word: "ढोल", emoji: "🪘", sound: "ढ से ढोल", english: "Dha se Dhol" },
    त: { word: "तितली", emoji: "🦋", sound: "त से तितली", english: "Ta se Titli" },
    थ: { word: "थैला", emoji: "👜", sound: "थ से थैला", english: "Tha se Thaila" },
    द: { word: "दीया", emoji: "🪔", sound: "द से दीया", english: "Da se Diya" },
    ध: { word: "धनुष", emoji: "🏹", sound: "ध से धनुष", english: "Dha se Dhanush" },
    न: { word: "नाव", emoji: "🚤", sound: "न से नाव", english: "Na se Naav" },
    प: { word: "पक्षी", emoji: "🐦", sound: "प से पक्षी", english: "Pa se Pakshi" },
    फ: { word: "फूल", emoji: "🌸", sound: "फ से फूल", english: "Pha se Phool" },
    ब: { word: "बंदर", emoji: "🐒", sound: "ब से बंदर", english: "Ba se Bandar" },
    भ: { word: "भालू", emoji: "🐻", sound: "भ से भालू", english: "Bha se Bhalu" },
    म: { word: "मछली", emoji: "🐟", sound: "म से मछली", english: "Ma se Machhli" },
    य: { word: "यज्ञ", emoji: "🔥", sound: "य से यज्ञ", english: "Ya se Yagya" },
    र: { word: "रथ", emoji: "🛞", sound: "र से रथ", english: "Ra se Rath" },
    ल: { word: "लड्डू", emoji: "🍯", sound: "ल से लड्डू", english: "La se Laddu" },
    व: { word: "वन", emoji: "🌳", sound: "व से वन", english: "Va se Van" },
    श: { word: "शेर", emoji: "🦁", sound: "श से शेर", english: "Sha se Sher" },
    ष: { word: "षटकोण", emoji: "⬡", sound: "ष से षटकोण", english: "Sha se Shatkona" },
    स: { word: "सूरज", emoji: "☀️", sound: "स से सूरज", english: "Sa se Suraj" },
    ह: { word: "हाथी", emoji: "🐘", sound: "ह से हाथी", english: "Ha se Haathi" },
    क्ष: { word: "क्षत्रिय", emoji: "🤴", sound: "क्ष से क्षत्रिय", english: "Ksha se Kshatriya" },
    त्र: { word: "त्रिशूल", emoji: "🔱", sound: "त्र से त्रिशूल", english: "Tra se Trishul" },
    ज्ञ: { word: "ज्ञान", emoji: "📚", sound: "ज्ञ से ज्ञान", english: "Gya se Gyaan" },
  };

  const speakText = (text: string) => {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    utterance.lang = 'hi-IN'; // Set language to Hindi
    
    // Try to find a Hindi voice
    const voices = speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => 
      voice.lang.includes('hi') || 
      voice.name.includes('Hindi') ||
      voice.name.includes('Google हिन्दी')
    );
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }
    
    speechSynthesis.speak(utterance);
    toast.success(`🔊 ${text}`);
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setShowWord(true);
    
    // Speak the letter and word
    const letterData = hindiConsonants[letter as keyof typeof hindiConsonants];
    speakText(letterData.sound);
    
    // Hide the word after 4 seconds
    setTimeout(() => {
      setShowWord(false);
    }, 4000);
  };

  const speakAllConsonants = () => {
    const allLetters = Object.keys(hindiConsonants).join(" ");
    speakText(allLetters);
  };

  const speakBarakhadi = () => {
    speakText("क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
              <span className="gradient-text-primary">🕉️ हिंदी वर्णमाला</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Hindi Consonants - Click on any letter to learn!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                onClick={speakBarakhadi}
                className="gap-2 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              >
                <Volume2 className="h-4 w-4" />
                बरखड़ी सुनें
              </Button>
              <Button 
                onClick={speakAllConsonants}
                className="gap-2 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600"
              >
                <Volume2 className="h-4 w-4" />
                सभी अक्षर सुनें
              </Button>
            </div>
          </div>

          {/* Selected Letter and Word Display */}
          {selectedLetter && showWord && (
            <div className="mb-8 text-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 border-4 border-orange-300 animate-bounce">
              <div className="text-8xl mb-4">
                {hindiConsonants[selectedLetter as keyof typeof hindiConsonants].emoji}
              </div>
              <div className="text-6xl font-bold text-gray-800 mb-2">
                {selectedLetter}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {hindiConsonants[selectedLetter as keyof typeof hindiConsonants].sound}
              </h2>
              <p className="text-xl text-gray-600">
                🔊 {hindiConsonants[selectedLetter as keyof typeof hindiConsonants].english}
              </p>
            </div>
          )}

          {/* Hindi Consonants Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mb-6">
            {Object.keys(hindiConsonants).map((letter) => (
              <Button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`h-16 w-16 text-2xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                  selectedLetter === letter 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg scale-110' 
                    : 'bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white'
                }`}
              >
                {letter}
              </Button>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-center bg-orange-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-orange-800 mb-2">
              🎯 खेल कैसे खेलें
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-orange-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👆</span>
                <span>कोई भी अक्षर दबाएं</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span>शब्द देखें</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔊</span>
                <span>आवाज़ सुनें</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-orange-600">
              <p>Learn Hindi consonants with fun words and sounds!</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HindiAlphabet;