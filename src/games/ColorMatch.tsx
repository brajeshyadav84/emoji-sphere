import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ColorMatch = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<{ id: number; color: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const colors = ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠"];

  const initializeGame = () => {
    const gameCards = [...colors, ...colors]
      .sort(() => Math.random() - 0.5)
      .map((color, index) => ({
        id: index,
        color,
        flipped: false,
        matched: false,
      }));
    setCards(gameCards);
    setFlippedCards([]);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].color === cards[second].color) {
        setScore(score + 20);
        toast.success("Match found! +20 points!");
        setTimeout(() => {
          setCards(cards.map((card, index) =>
            index === first || index === second
              ? { ...card, matched: true }
              : card
          ));
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(cards.map((card, index) =>
            index === first || index === second
              ? { ...card, flipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards]);

  const handleCardClick = (index: number) => {
    if (flippedCards.length >= 2 || cards[index].flipped || cards[index].matched) {
      return;
    }

    setCards(cards.map((card, i) =>
      i === index ? { ...card, flipped: true } : card
    ));
    setFlippedCards([...flippedCards, index]);
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
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Color Match
            </h1>
            <p className="text-lg text-muted-foreground">
              Find matching pairs!
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all duration-300 ${
                  card.flipped || card.matched
                    ? "bg-secondary"
                    : "bg-primary hover:scale-105"
                } ${card.matched ? "opacity-50" : ""}`}
                disabled={card.matched}
              >
                {(card.flipped || card.matched) ? card.color : "❓"}
              </button>
            ))}
          </div>

          <Button
            onClick={initializeGame}
            variant="outline"
            className="w-full"
          >
            New Game
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default ColorMatch;