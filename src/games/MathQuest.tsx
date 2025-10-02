import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MathQuest = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState("+");
  const [answer, setAnswer] = useState("");

  const generateQuestion = () => {
    const operators = ["+", "-"];
    const op = operators[Math.floor(Math.random() * operators.length)];
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setAnswer("");
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleSubmit = () => {
    let correctAnswer = 0;
    if (operator === "+") {
      correctAnswer = num1 + num2;
    } else {
      correctAnswer = num1 - num2;
    }

    if (parseInt(answer) === correctAnswer) {
      setScore(score + 10);
      toast.success("Correct! +10 points!");
      generateQuestion();
    } else {
      toast.error(`Oops! The answer was ${correctAnswer}`);
      generateQuestion();
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
            <div className="text-6xl mb-4">🔢</div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text-primary">Math Quest</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Solve the math problems!
            </p>
            <div className="mt-4 text-2xl font-bold text-primary">
              Score: {score}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/20 rounded-lg p-8">
              <div className="text-center text-6xl font-bold text-primary mb-6">
                {num1} {operator} {num2} = ?
              </div>
              
              <Input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer"
                className="text-center text-2xl h-14"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-xl gradient-success"
              disabled={!answer}
            >
              Check Answer
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MathQuest;