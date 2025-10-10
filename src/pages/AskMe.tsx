import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Camera, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // base64 image data
}

const AskMe = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setSelectedImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedImage) {
      toast.error("Please enter a question or upload an image!");
      return;
    }

    const userMessage = message.trim();
    const userMessageObj: Message = {
      role: "user",
      content: userMessage || "Please help me with this homework image:",
      image: selectedImage || undefined
    };

    setMessage("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    
    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      const requestBody: { message: string; image?: string } = { 
        message: userMessage || "Please help me with this homework image:" 
      };
      if (selectedImage) {
        requestBody.image = selectedImage;
      }

      const { data, error } = await supabase.functions.invoke("ask-me", {
        body: requestBody,
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
              <h1 className="text-2xl font-bold">Homework help 🤔</h1>
              <p className="text-muted-foreground text-sm">
                Quick, clear guidance for your child's schoolwork and projects.
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
                <li>• 📸 <strong>Take a photo</strong> of your homework for instant help!</li>
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
                  {msg.image && (
                    <div className="mb-2">
                      <img 
                        src={msg.image} 
                        alt="Homework" 
                        className="max-w-full h-auto rounded-lg border-2 border-white/20"
                      />
                    </div>
                  )}
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
            {/* Hidden file inputs */}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Image preview */}
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected homework"
                  className="max-w-full h-48 object-contain rounded-lg border-2 border-primary/20"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={removeSelectedImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Camera and file upload buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                className="flex-1"
                disabled={isLoading}
              >
                <Camera className="mr-2 h-4 w-4" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleFileSelect}
                className="flex-1"
                disabled={isLoading}
              >
                <Image className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your question here or upload an image of your homework..."
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={isLoading || (!message.trim() && !selectedImage)}
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
