import { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Smile } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Friend {
  id: number;
  name: string;
  emoji: string;
  lastMessage: string;
  time: string;
  online: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: "me" | "friend";
  time: string;
}

const Chat = () => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const friends: Friend[] = [
    {
      id: 1,
      name: "Alex the Artist",
      emoji: "🎨",
      lastMessage: "That's so cool!",
      time: "2 min ago",
      online: true,
    },
    {
      id: 2,
      name: "Music Maker Maya",
      emoji: "🎵",
      lastMessage: "Want to play together?",
      time: "10 min ago",
      online: true,
    },
    {
      id: 3,
      name: "Science Sam",
      emoji: "🔬",
      lastMessage: "Did you see my post?",
      time: "1 hour ago",
      online: false,
    },
    {
      id: 4,
      name: "Book Buddy Ben",
      emoji: "📚",
      lastMessage: "I love that story too!",
      time: "2 hours ago",
      online: false,
    },
    {
      id: 5,
      name: "Game Master Gina",
      emoji: "🎮",
      lastMessage: "See you later!",
      time: "Yesterday",
      online: false,
    },
  ];

  const sampleMessages: Message[] = selectedFriend
    ? [
        {
          id: 1,
          text: "Hey! How are you doing? 😊",
          sender: "friend",
          time: "10:30 AM",
        },
        {
          id: 2,
          text: "Hi! I'm doing great! Just finished my homework 📚",
          sender: "me",
          time: "10:32 AM",
        },
        {
          id: 3,
          text: "That's awesome! Want to play a game later? 🎮",
          sender: "friend",
          time: "10:33 AM",
        },
        {
          id: 4,
          text: "Yes! That sounds like fun! ✨",
          sender: "me",
          time: "10:35 AM",
        },
      ]
    : [];

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message
      setMessageText("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-4xl font-bold mb-6 gradient-primary bg-clip-text text-transparent">
          Messages 💬
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-240px)]">
          {/* Friends List */}
          <Card className="lg:col-span-4 p-4 shadow-playful flex flex-col">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedFriend?.id === friend.id
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="text-3xl">{friend.emoji}</div>
                        {friend.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {friend.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {friend.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-8 shadow-playful flex flex-col">
            {selectedFriend ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="text-3xl">{selectedFriend.emoji}</div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedFriend.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedFriend.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {sampleMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "me" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            message.sender === "me"
                              ? "gradient-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <span
                            className={`text-xs mt-1 block ${
                              message.sender === "me"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type a nice message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="gradient-primary"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold mb-2">Select a Friend</h2>
                  <p className="text-muted-foreground">
                    Choose a friend from the list to start chatting!
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chat;
