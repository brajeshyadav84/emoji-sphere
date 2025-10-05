import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AskMe = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a question!");
      return;
    }

    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ask-me", {
        body: { message: userMessage },
      });

      if (error) throw error;

      if (data?.answer) {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        throw new Error("No answer received");
      }
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to get an answer. Please try again!");
      // Remove the user message if we failed to get a response
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-6 shadow-playful border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Ask Me Anything! 🤔</h1>
              <p className="text-muted-foreground text-sm">
                I'm here to help answer your questions!
              </p>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="mb-6 p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Try asking me about:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• How do plants grow? 🌱</li>
                <li>• What is gravity? 🪐</li>
                <li>• How do computers work? 💻</li>
                <li>• Why is the sky blue? ☁️</li>
                <li>• Help with homework or any topic!</li>
              </ul>
            </div>
          )}

          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-2xl bg-muted">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question here..."
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={isLoading || !message.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? "Getting answer..." : "Ask Question"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default AskMe;
