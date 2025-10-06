import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Hand, HelpCircle } from "lucide-react";

interface RoomMessage {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface RoomChatProps {
  onRaiseHand?: () => void;
  onAskQuestion?: () => void;
}

const RoomChat: React.FC<RoomChatProps> = ({ onRaiseHand, onAskQuestion }) => {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const emojiList = [
    "😊", "❤️", "🎉", "⭐", "🌈", "🎮", "🎵", "🌞", "🦄", "🌸",
    "🚀", "🎯", "🏆", "🎪", "🎬", "📚", "🔥", "🪐", "🌟", "🎈",
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: messageText,
          sender: "me",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setMessageText("");
    }
  };

  const handleEmojiClick = (emoji: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = messageText.slice(0, start) + emoji + messageText.slice(end);
    setMessageText(newValue);
    setShowEmojiPicker(false);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-muted/30 rounded">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-md " +
                (msg.sender === "me"
                  ? "gradient-primary text-primary-foreground"
                  : "bg-white")
              }`}
            >
              <span>{msg.text}</span>
              <span className="block text-xs mt-1 text-muted-foreground">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 p-2 border-t bg-white rounded-b">
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setShowEmojiPicker((v) => !v)}
            aria-label="Show emoji picker"
          >
            <Smile className="h-5 w-5" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute left-0 bottom-12 z-50 bg-background border rounded-xl shadow-lg p-2 w-64 max-w-xs grid grid-cols-8 gap-2">
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  className="text-2xl hover:bg-muted rounded-lg p-1 focus:outline-none"
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} className="gradient-primary">
          <Send className="h-5 w-5" />
        </Button>
        <Button variant="ghost" onClick={onRaiseHand} title="Raise Hand">
          <Hand className="h-5 w-5 text-yellow-500" />
        </Button>
        <Button variant="ghost" onClick={onAskQuestion} title="Ask Question">
          <HelpCircle className="h-5 w-5 text-blue-500" />
        </Button>
      </div>
    </div>
  );
};

export default RoomChat;
