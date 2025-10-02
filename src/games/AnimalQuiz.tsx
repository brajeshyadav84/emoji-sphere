import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AnimalQuiz = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      question: "What sound does a lion make?",
      emoji: "🦁",
      options: ["Roar", "Meow", "Bark", "Moo"],
      correct: 0,
    },
    {
      question: "Where do fish live?",
      emoji: "🐠",
      options: ["Trees", "Water", "Desert", "Sky"],
      correct: 1,
    },
    {
      question: "What do bees make?",
      emoji: "🐝",
      options: ["Milk", "Eggs", "Honey", "Butter"],
      correct: 2,
    },
    {
      question: "How many legs does a spider have?",
      emoji: "🕷️",
      options: ["6", "4", "10", "8"],
      correct: 3,
    },
    {
      question: "What do pandas eat?",
      emoji: "🐼",
      options: ["Fish", "Bamboo", "Meat", "Nuts"],
      correct: 1,
    },
  ];

  const handleAnswer = (selectedIndex: number) => {
    if (selectedIndex === questions[currentQuestion].correct) {
      setScore(score + 20);
      toast.success("Correct! +20 points!");
    } else {
      toast.error("Oops! Try the next one!");
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      toast.success(`Quiz complete! Final score: ${score + (selectedIndex === questions[currentQuestion].correct ? 20 : 0)}`);
      setCurrentQuestion(0);
      setScore(0);
    }
  };

  const question = questions[currentQuestion];

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
            <div className="text-6xl mb-4">{question.emoji}</div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text-primary">Animal Quiz</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/20 rounded-lg p-6 text-center">
              <p className="text-2xl font-semibold">{question.question}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="h-20 text-lg gradient-secondary"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AnimalQuiz;