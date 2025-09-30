import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Smile, Image } from "lucide-react";

const CreatePost = () => {
  const [postText, setPostText] = useState("");

  const emojis = ["😊", "❤️", "🎉", "⭐", "🌈", "🎨", "🎮", "🎵", "🌟", "✨", "🦄", "🌸"];

  const addEmoji = (emoji: string) => {
    setPostText(postText + emoji);
  };

  return (
    <Card className="p-6 shadow-playful hover:shadow-hover transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-2xl flex-shrink-0">
          😊
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind? Share something nice! 🌈"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="min-h-[100px] border-2 border-border focus:border-primary resize-none text-base"
          />
          
          <div className="mt-4 flex flex-wrap gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="text-2xl hover:scale-125 transition-transform duration-200"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Image className="h-4 w-4" />
                Add Image
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Smile className="h-4 w-4" />
                More Emojis
              </Button>
            </div>
            <Button className="gradient-primary font-semibold">
              Share Post 🚀
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;
