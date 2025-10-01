import { useRef, useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eraser, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DrawingBoard = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#FF6B6B");
  const [brushSize, setBrushSize] = useState(5);

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#F7DC6F",
    "#BB8FCE",
    "#52D726",
    "#FF8C00",
    "#FF1493",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;

    if (e.type === "mousedown") {
      context.beginPath();
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
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

        <Card className="p-8 max-w-4xl mx-auto shadow-playful">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="text-3xl font-bold mb-2 gradient-primary bg-clip-text text-transparent">
              Drawing Board
            </h1>
            <p className="text-lg text-muted-foreground">
              Create your masterpiece!
            </p>
          </div>

          <div className="space-y-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border-4 border-primary rounded-lg cursor-crosshair w-full bg-white"
              style={{ touchAction: "none" }}
            />

            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-4 ${
                      color === c ? "border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  onClick={() => setBrushSize(3)}
                  variant={brushSize === 3 ? "default" : "outline"}
                  size="sm"
                >
                  Small
                </Button>
                <Button
                  onClick={() => setBrushSize(5)}
                  variant={brushSize === 5 ? "default" : "outline"}
                  size="sm"
                >
                  Medium
                </Button>
                <Button
                  onClick={() => setBrushSize(10)}
                  variant={brushSize === 10 ? "default" : "outline"}
                  size="sm"
                >
                  Large
                </Button>
              </div>

              <Button
                onClick={() => setColor("white")}
                variant="outline"
                className="gap-2"
              >
                <Eraser className="h-4 w-4" />
                Eraser
              </Button>

              <Button
                onClick={clearCanvas}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DrawingBoard;