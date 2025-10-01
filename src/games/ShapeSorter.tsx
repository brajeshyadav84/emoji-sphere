import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ShapeSorter = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentShape, setCurrentShape] = useState({ shape: "circle", color: "red" });

  const shapes = [
    { name: "circle", emoji: "⭕" },
    { name: "square", emoji: "🟦" },
    { name: "triangle", emoji: "🔺" },
    { name: "star", emoji: "⭐" },
  ];

  const generateNewShape = () => {
    const shape = shapes[Math.floor(Math.random() * shapes.length)].name;
    setCurrentShape({ shape, color: "primary" });
  };

  const handleShapeSelect = (selectedShape: string) => {
    if (selectedShape === currentShape.shape) {
      setScore(score + 15);
      toast.success("Correct! +15 points!");
      generateNewShape();
    } else {
      toast.error("Try again!");
    }
  };

  const getCurrentEmoji = () => {
    const shape = shapes.find((s) => s.name === currentShape.shape);
    return shape?.emoji || "⭕";
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
            <div className="text-6xl mb-4">🔷</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Shape Sorter
            </h1>
            <p className="text-lg text-muted-foreground">
              Click the matching shape!
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-secondary/20 rounded-lg p-12 flex items-center justify-center">
              <div className="text-9xl animate-fade-in">{getCurrentEmoji()}</div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {shapes.map((shape) => (
                <Button
                  key={shape.name}
                  onClick={() => handleShapeSelect(shape.name)}
                  className="h-24 text-5xl gradient-secondary hover:scale-105 transition-transform"
                >
                  {shape.emoji}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ShapeSorter;