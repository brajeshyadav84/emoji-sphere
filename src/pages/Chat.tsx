import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Smile } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetFriendsQuery } from "@/store/api/userApi";
import { 
  useGetConversationsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useStartConversationMutation,
  ChatMessage,
  Conversation 
} from "@/store/api/chatApi";
import { getAvatarByGender } from "@/utils/avatarUtils";
import { FriendshipResponse } from "@/store/api/userApi";

interface Friend {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  gender?: string;
}

const Chat = () => {
  const location = useLocation();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showHighlightAnimation, setShowHighlightAnimation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected friend from navigation state
  const routeSelectedFriend = location.state?.selectedFriend;

  // API hooks
  const { data: friendsResponse, isLoading: friendsLoading, error: friendsError } = useGetFriendsQuery({ page: 0, size: 50 });
  const { data: conversationsResponse } = useGetConversationsQuery({ page: 0, size: 20 });
  const { data: messagesResponse, isLoading: messagesLoading } = useGetMessagesQuery(
    selectedConversationId ? { conversationId: selectedConversationId, page: 0, size: 50 } : { conversationId: 0 },
    { skip: !selectedConversationId }
  );

  // Mutations
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const [startConversation] = useStartConversationMutation();

  // Transform API response to Friend interface - filter only accepted friendships
  const friends: Friend[] = friendsResponse?.friends
    ?.filter((friendship: FriendshipResponse) => friendship.status === 'ACCEPTED')
    ?.map((friendship: FriendshipResponse) => ({
      id: friendship.otherUserId,
      name: friendship.otherUser?.fullName || 'Unknown User',
      avatar: getAvatarByGender(friendship.otherUser?.gender),
      lastMessage: "Start a conversation",
      time: new Date(friendship.createdAt).toLocaleDateString(),
      online: Math.random() > 0.5, // Random online status for demo
      gender: friendship.otherUser?.gender
    })) || [];

  // Find existing conversation for selected friend
  const findConversationForFriend = (friendId: number): Conversation | undefined => {
    return conversationsResponse?.conversations?.find(conv => conv.otherUserId === friendId);
  };

  // Update friends with last message info from conversations
  const friendsWithConversations = friends.map(friend => {
    const conversation = findConversationForFriend(friend.id);
    return {
      ...friend,
      lastMessage: conversation?.lastMessage || "Start a conversation",
      time: conversation?.lastMessageTime ? 
        new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
        friend.time
    };
  });

  const filteredFriends = friendsWithConversations.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select friend from route state when friends load
  useEffect(() => {
    if (routeSelectedFriend && friends.length > 0 && !selectedFriend) {
      const friendFromRoute = friends.find(friend => friend.id === routeSelectedFriend.id);
      if (friendFromRoute) {
        setSelectedFriend(friendFromRoute);
        setShowHighlightAnimation(true);
        
        // Check if conversation exists, if not start one
        const existingConversation = findConversationForFriend(friendFromRoute.id);
        if (existingConversation) {
          setSelectedConversationId(existingConversation.id);
        } else {
          // Start a new conversation
          startConversation(friendFromRoute.id)
            .unwrap()
            .then((result) => {
              setSelectedConversationId(result.conversationId);
            })
            .catch((error) => {
              console.error('Failed to start conversation:', error);
            });
        }
        
        setSidebarCollapsed(true);
        setTimeout(() => setShowHighlightAnimation(false), 3000);
      }
    }
  }, [routeSelectedFriend, friends, selectedFriend, conversationsResponse]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowHighlightAnimation(false);
    setSearchQuery("");

    // Find or create conversation
    const existingConversation = findConversationForFriend(friend.id);
    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
    } else {
      // Start a new conversation
      startConversation(friend.id)
        .unwrap()
        .then((result) => {
          setSelectedConversationId(result.conversationId);
        })
        .catch((error) => {
          console.error('Failed to start conversation:', error);
        });
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedFriend) {
      try {
        // Determine message type
        const isEmojiOnly = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]+$/u.test(messageText.trim());
        
        await sendMessage({
          receiverId: selectedFriend.id,
          messageText: messageText.trim(),
          messageType: isEmojiOnly ? 'EMOJI' : 'TEXT'
        }).unwrap();
        
        setMessageText("");
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  // Insert emoji at cursor position in input
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

  // Emoji list
  const emojiList = [
    "😊", "❤️", "🎉", "⭐", "🌈", "🎨", "🎮", "🎵", "🌞", "🦄", "😄",
    "🚀", "🎯", "🏆", "🎪", "🦷", "🎬", "📚", "🔥", "🪐", "🌟", "🍇", "🎈",
    "🍰", "🎂", "🌺"
  ];

  return (
    <div className="min-h-screen h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col w-full max-w-full px-0 sm:px-4 py-0 sm:py-6 mx-auto">
        <h1 className="text-4xl font-bold mb-6 hidden sm:block">
          <span className="gradient-text-primary">Messages</span> 💬
        </h1>

        {friendsLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your friends...</p>
            </div>
          </div>
        )}

        {friendsError && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-muted-foreground">Failed to load friends. Please try again.</p>
            </div>
          </div>
        )}

        {!friendsLoading && !friendsError && friends.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold mb-2">No Friends Yet</h2>
              <p className="text-muted-foreground">
                Start making friends to begin chatting!
              </p>
            </div>
          </div>
        )}

        {!friendsLoading && !friendsError && friends.length > 0 && (
          <div className="flex flex-1 min-h-0 gap-2">
            {/* Mobile Sidebar */}
            <div className="relative h-full flex flex-col z-20 md:hidden">
              <div className="flex flex-col items-center py-8 gap-2 flex-1 overflow-y-auto w-14 bg-background shadow-playful rounded-xl">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full mb-1
                      ${selectedFriend?.id === friend.id ? 'ring-2 ring-primary' : ''}
                      ${friend.online ? '' : 'opacity-60'}
                      bg-muted hover:bg-muted/70 transition-all duration-200`}
                    title={friend.name}
                  >
                    <span className="text-2xl">{friend.avatar}</span>
                  </button>
                ))}
              </div>
              
              {sidebarCollapsed ? (
                <button
                  className="absolute top-2 right-[-18px] z-50 p-1 rounded-full bg-muted hover:bg-muted/70 border shadow"
                  onClick={() => setSidebarCollapsed(false)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : null}
              
              {!sidebarCollapsed && (
                <div className="fixed inset-0 z-40 flex" style={{ pointerEvents: 'none' }}>
                  <div className="h-full w-60 bg-background shadow-xl rounded-r-xl flex flex-col pt-16 p-4 relative" style={{ pointerEvents: 'auto' }}>
                    <button
                      className="absolute top-4 left-2 z-50 p-1 rounded-full bg-muted hover:bg-muted/70 border shadow"
                      onClick={() => setSidebarCollapsed(true)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
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
                            onClick={() => {
                              handleSelectFriend(friend);
                              setSidebarCollapsed(true);
                            }}
                            className={`w-full p-2 rounded-xl text-left flex items-center gap-2 transition-all duration-200 ${
                              selectedFriend?.id === friend.id
                                ? `bg-primary/10 border-2 border-primary ${showHighlightAnimation ? 'ring-2 ring-primary/20 animate-pulse' : ''}`
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            <span className="text-2xl">{friend.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-sm truncate">{friend.name}</h3>
                                <span className="text-xs text-muted-foreground">{friend.time}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{friend.lastMessage}</p>
                            </div>
                            {friend.online && (
                              <div className="w-2 h-2 bg-success rounded-full ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex-1" style={{ pointerEvents: 'auto' }} onClick={() => setSidebarCollapsed(true)} />
                </div>
              )}
            </div>
            
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-72 h-full bg-background shadow-playful rounded-xl p-4 z-10">
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
                      onClick={() => handleSelectFriend(friend)}
                      className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all duration-200 ${
                        selectedFriend?.id === friend.id
                          ? `bg-primary/10 border-2 border-primary ${showHighlightAnimation ? 'ring-2 ring-primary/20 animate-pulse' : ''}`
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <div className="relative">
                        <span className="text-3xl">{friend.avatar}</span>
                        {friend.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm truncate">{friend.name}</h3>
                          <span className="text-xs text-muted-foreground">{friend.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{friend.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex">
              <Card className="flex-1 shadow-playful flex flex-col">
                {selectedFriend ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center gap-3">
                      <div className="text-3xl">{selectedFriend.avatar}</div>
                      <div>
                        <h2 className="font-bold text-lg">{selectedFriend.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedFriend.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messagesResponse?.messages?.map((message: ChatMessage) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderId === selectedFriend.id ? "justify-start" : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-2xl ${
                                  message.senderId === selectedFriend.id
                                    ? "bg-muted"
                                    : "gradient-primary text-primary-foreground"
                                }`}
                              >
                                <p className="text-sm">{message.messageText}</p>
                                <span
                                  className={`text-xs mt-1 block ${
                                    message.senderId === selectedFriend.id
                                      ? "text-muted-foreground"
                                      : "text-primary-foreground/80"
                                  }`}
                                >
                                  {new Date(message.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          )) || (
                            <div className="text-center text-muted-foreground py-8">
                              <div className="text-4xl mb-2">💬</div>
                              <p>Start your conversation by sending a message!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => setShowEmojiPicker((v) => !v)}
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                          {showEmojiPicker && (
                            <div className="absolute left-0 bottom-12 z-50 bg-background border rounded-xl shadow-lg p-2 w-72 max-w-xs grid grid-cols-8 gap-2">
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
                          disabled={!messageText.trim()}
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;