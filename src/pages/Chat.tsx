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
import { 
  useGetFriendsStatusQuery,
  useSetUserOnlineMutation,
  useSetUserOfflineMutation,
  useSendHeartbeatMutation 
} from "@/store/api/presenceApi";
import { useUserPresence } from "@/hooks/useUserPresence";
import { getAvatarByGender } from "@/utils/avatarUtils";
import { FriendshipResponse } from "@/store/api/userApi";
import OnlineStatusIndicator from "@/components/OnlineStatusIndicator";
import websocketService, { ChatMessage as WsChatMessage } from "@/services/websocketService";

interface Friend {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  gender?: string;
  hasNewMessages?: boolean;
  unreadCount?: number;
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
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState<number | null>(null);
  const [newMessageNotification, setNewMessageNotification] = useState<{ friendId: number; count: number } | null>(null);
  const [friendsWithNewMessages, setFriendsWithNewMessages] = useState<Set<number>>(new Set());
  const [lastReadMessages, setLastReadMessages] = useState<Map<number, number>>(new Map());
  const [unreadCounts, setUnreadCounts] = useState<Map<number, number>>(new Map());
  const [wsConnected, setWsConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio notification not available');
    }
  };

  // Get selected friend from navigation state
  const routeSelectedFriend = location.state?.selectedFriend;

  // API hooks
  const { data: friendsResponse, isLoading: friendsLoading, error: friendsError } = useGetFriendsQuery({ page: 0, size: 50 });
  const { data: conversationsResponse, refetch: refetchConversations } = useGetConversationsQuery(
    { page: 0, size: 20 },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );
  const { data: messagesResponse, isLoading: messagesLoading, refetch: refetchMessages } = useGetMessagesQuery(
    selectedConversationId ? { conversationId: selectedConversationId, page: 0, size: 50 } : { conversationId: 0 },
    { 
      skip: !selectedConversationId,
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );
  
  // Presence API hooks
  const { data: friendsStatusResponse } = useGetFriendsStatusQuery(undefined, {
    pollingInterval: 120000, // Poll every 120 seconds for online status
    refetchOnFocus: true,
    refetchOnReconnect: true
  });
  
  // Use custom presence hook for automatic online/offline management
  useUserPresence();

  // Mutations
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();
  const [startConversation] = useStartConversationMutation();

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await websocketService.connect();
        console.log('✅ WebSocket connected successfully');
      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
      }
    };

    initWebSocket();

    // Setup connection status listener
    const unsubscribe = websocketService.onConnectionChange((connected) => {
      setWsConnected(connected);
      console.log(`WebSocket ${connected ? 'connected' : 'disconnected'}`);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to selected conversation's messages
  useEffect(() => {
    if (!selectedConversationId || !wsConnected) return;

    console.log(`📡 Subscribing to conversation ${selectedConversationId}`);
    websocketService.subscribeToConversation(selectedConversationId);

    // Listen for new messages in this conversation
    const unsubscribeMessages = websocketService.onMessage(
      selectedConversationId,
      (message) => {
        console.log('📨 Received real-time message:', message);
        
        // Refetch messages to sync with server
        refetchMessages();
        refetchConversations();

        // Play notification sound if message is from friend
        if (message.senderId === selectedFriend?.id) {
          playNotificationSound();
        }

        // Mark as read automatically
        if (message.id) {
          websocketService.sendReadReceipt(selectedConversationId, [message.id]);
        }
      }
    );

    // Listen for typing indicators
    const unsubscribeTyping = websocketService.onTyping(
      selectedConversationId,
      (typing) => {
        console.log('⌨️ Typing indicator:', typing);
        if (typing.userId === selectedFriend?.id) {
          setFriendTyping(typing.isTyping ? typing.userId : null);
        }
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      websocketService.unsubscribeFromConversation(selectedConversationId);
    };
  }, [selectedConversationId, wsConnected, selectedFriend, refetchMessages, refetchConversations]);

  // Listen for read receipts
  useEffect(() => {
    if (!wsConnected) return;

    const unsubscribe = websocketService.onReadReceipt((receipt) => {
      console.log('✓✓ Read receipt received:', receipt);
      // Refetch messages to update read status
      if (receipt.conversationId === selectedConversationId) {
        refetchMessages();
      }
    });

    return () => unsubscribe();
  }, [wsConnected, selectedConversationId, refetchMessages]);

  // Transform API response to Friend interface - filter only accepted friendships
  const friends: Friend[] = friendsResponse?.data?.friends
    ?.filter((friendship: FriendshipResponse) => friendship.status === 'ACCEPTED')
    ?.map((friendship: FriendshipResponse) => {
      // Get online status from friends status response
      const friendStatus = friendsStatusResponse?.friendsStatus?.find(
        status => status.userId === friendship.otherUserId
      );
      
      return {
        id: friendship.otherUserId,
        name: friendship.otherUser?.fullName || 'Unknown User',
        avatar: getAvatarByGender(friendship.otherUser?.gender),
        lastMessage: "Start a conversation",
        time: new Date(friendship.createdAt).toLocaleDateString(),
        online: friendship.otherUser?.isOnline || false, // Use real online status from API
        gender: friendship.otherUser?.gender
      };
    }) || [];

  // Find existing conversation for selected friend
  const findConversationForFriend = (friendId: number): Conversation | undefined => {
    return conversationsResponse?.data?.conversations?.find(conv => conv.otherUserId === friendId);
  };

  // Update friends with last message info from conversations and unread count
  const friendsWithConversations = friends.map(friend => {
    const conversation = findConversationForFriend(friend.id);
    const hasNewMessages = friendsWithNewMessages.has(friend.id) && selectedFriend?.id !== friend.id;
    const isSelected = selectedFriend?.id === friend.id;
    
    // Get unread count from state
    const unreadCount = isSelected ? 0 : (unreadCounts.get(friend.id) || 0);
    
    return {
      ...friend,
      lastMessage: conversation?.lastMessage || "Start a conversation",
      time: conversation?.lastMessageTime ? 
        new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
        friend.time,
      hasNewMessages,
      unreadCount
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesResponse?.data?.messages]);

  // Handle new message notifications and sound
  useEffect(() => {
    if (messagesResponse?.data?.messages && selectedConversationId) {
      const currentMessageCount = messagesResponse.data.messages.length;

      if (lastMessageCountRef.current > 0 && currentMessageCount > lastMessageCountRef.current) {
        // New message received
        const lastMessage = messagesResponse.data.messages[messagesResponse.data.messages.length - 1];

        // If the message is from the friend (not from current user)
        if (lastMessage.senderId === selectedFriend?.id) {
          // Play notification sound
          try {
            const audio = new Audio('/notification.mp3'); // You'll need to add this sound file
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore if audio fails
          } catch (error) {
            // Fallback: create a simple beep using Web Audio API
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.1);
            } catch (audioError) {
              console.log('Audio notification not available');
            }
          }
          
          // Show visual notification
          setNewMessageNotification({ friendId: selectedFriend.id, count: 1 });
          setTimeout(() => setNewMessageNotification(null), 3000);
        }
      }
      
      lastMessageCountRef.current = currentMessageCount;
    }
  }, [messagesResponse?.data?.messages, selectedConversationId, selectedFriend]);

  // Detect new messages in conversations for friends not currently selected
  useEffect(() => {
    if (conversationsResponse?.data?.conversations && friends.length > 0) {
      const newFriendsWithMessages = new Set<number>();

      conversationsResponse.data.conversations.forEach(conversation => {
        // Only mark as having new messages if this friend is not currently selected
        if (selectedFriend?.id !== conversation.otherUserId) {
          const lastReadMessageId = lastReadMessages.get(conversation.otherUserId);
          
          // If we haven't read this conversation yet, or if there's a newer message
          if (!lastReadMessageId || (conversation?.id && conversation?.id > lastReadMessageId)) {
            newFriendsWithMessages.add(conversation.otherUserId);
          }
        }
      });
      
      // Update the state if there are changes
      if (newFriendsWithMessages.size !== friendsWithNewMessages.size || 
          ![...newFriendsWithMessages].every(id => friendsWithNewMessages.has(id))) {
        setFriendsWithNewMessages(newFriendsWithMessages);
      }
    }
  }, [conversationsResponse, selectedFriend, lastReadMessages, friends]);

  // Simulate new messages from other friends for demo purposes
  useEffect(() => {
    if (friends.length > 1) {
      const interval = setInterval(() => {
        // Randomly add new message notifications for friends not currently selected
        const nonSelectedFriends = friends.filter(f => f.id !== selectedFriend?.id);
        if (nonSelectedFriends.length > 0 && Math.random() > 0.7) { // 30% chance every interval
          const randomFriend = nonSelectedFriends[Math.floor(Math.random() * nonSelectedFriends.length)];
          setFriendsWithNewMessages(prev => {
            const newSet = new Set(prev);
            newSet.add(randomFriend.id);
            return newSet;
          });
          
          // Play notification sound if not currently chatting with anyone
          if (!selectedFriend) {
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.1);
            } catch (audioError) {
              console.log('Audio notification not available');
            }
          }
        }
      }, 8000); // Check every 8 seconds

      return () => clearInterval(interval);
    }
  }, [friends, selectedFriend]);

  // Send typing indicator via WebSocket
  useEffect(() => {
    if (!selectedConversationId || !wsConnected) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (messageText.length > 0) {
      setIsTyping(true);
      
      // Send typing indicator
      websocketService.sendTyping(selectedConversationId, true);
      
      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        websocketService.sendTyping(selectedConversationId, false);
      }, 1000);
    } else {
      setIsTyping(false);
      websocketService.sendTyping(selectedConversationId, false);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, selectedConversationId, wsConnected]);

  // Sync unreadCounts from conversations API response
  useEffect(() => {
    if (conversationsResponse?.data?.conversations) {
      setUnreadCounts(prev => {
        const newMap = new Map<number, number>();
        conversationsResponse.data.conversations.forEach((conv: any) => {
          if (typeof conv.unreadCount === 'number' && conv.otherUserId) {
            newMap.set(conv.otherUserId, conv.unreadCount);
          }
        });
        return newMap;
      });
    }
  }, [conversationsResponse]);
  

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowHighlightAnimation(false);
    setSearchQuery("");
    
    // Clear new message notification for this friend
    if (newMessageNotification?.friendId === friend.id) {
      setNewMessageNotification(null);
    }

    // Clear new message indicator for this friend
    setFriendsWithNewMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(friend.id);
      return newSet;
    });

    // Clear unread count for this friend
    setUnreadCounts(prev => {
      const newMap = new Map(prev);
      newMap.delete(friend.id);
      return newMap;
    });

    // Mark conversation as read
    const conversation = findConversationForFriend(friend.id);
    if (conversation?.id) {
      setLastReadMessages(prev => {
        const newMap = new Map(prev);
        newMap.set(friend.id, conversation?.id);
        return newMap;
      });
    }

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
    if (messageText.trim() && selectedFriend && selectedConversationId) {
      const messageToSend = messageText.trim();
      
      // Clear input immediately for better UX
      setMessageText("");
      
      try {
        // Determine message type
        const isEmojiOnly = /^[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\p{Emoji_Modifier_Base}\p{Emoji_Presentation}]+$/u.test(messageToSend);
        
        // Send via WebSocket if connected, otherwise use HTTP API
        if (wsConnected) {
          const wsMessage: WsChatMessage = {
            conversationId: selectedConversationId,
            senderId: websocketService.getUserId() || 0,
            receiverId: selectedFriend.id,
            messageText: messageToSend,
            messageType: isEmojiOnly ? 'EMOJI' : 'TEXT'
          };
          
          websocketService.sendMessage(wsMessage);
          console.log('📤 Message sent via WebSocket');
        } else {
          // Fallback to HTTP API
          await sendMessage({
            receiverId: selectedFriend.id,
            messageText: messageToSend,
            messageType: isEmojiOnly ? 'EMOJI' : 'TEXT'
          }).unwrap();
          console.log('📤 Message sent via HTTP');
          
          // Refetch messages
          refetchMessages();
          refetchConversations();
        }
        
      } catch (error) {
        console.error('Failed to send message:', error);
        
        // Show error feedback and restore message
        setMessageText(messageToSend);
        
        // Show error animation
        const errorIndicator = document.createElement('div');
        errorIndicator.innerHTML = '❌ Failed to send';
        errorIndicator.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 text-sm font-bold z-50 bg-background border rounded-lg px-4 py-2 shadow-lg';
        document.body.appendChild(errorIndicator);
        setTimeout(() => document.body.removeChild(errorIndicator), 3000);
        
        // Focus back on input
        if (inputRef.current) {
          inputRef.current.focus();
        }
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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as HTMLElement;
        const emojiPicker = document.querySelector('[data-emoji-picker]');
        const emojiButton = document.querySelector('[data-emoji-button]');
        
        if (emojiPicker && !emojiPicker.contains(target) && 
            emojiButton && !emojiButton.contains(target)) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  // Emoji list
  const emojiList = [
    "😊", "❤️", "🎉", "⭐", "🌈", "🎨", "🎮", "🎵", "🌞", "🦄", "😄",
    "🚀", "🎯", "🏆", "🎪", "🦷", "🎬", "📚", "🔥", "🪐", "🌟", "🍇", "🎈",
    "🍰", "🎂", "🌺"
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col w-full max-w-full px-0 sm:px-4 py-0 sm:py-6 mx-auto min-h-0">
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
          <div className="flex flex-1 min-h-0 gap-2 h-full">
            {/* Mobile Sidebar */}
            <div className="relative h-full flex flex-col z-20 md:hidden">
              <div className="flex flex-col items-center py-8 gap-2 flex-1 overflow-y-auto w-14 bg-background shadow-playful rounded-xl max-h-full">
                {filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 relative
                      ${selectedFriend?.id === friend.id ? 'ring-2 ring-primary' : ''}
                      ${friend.online ? '' : 'opacity-60'}
                      bg-muted hover:bg-muted/70 transition-all duration-200`}
                    title={friend.name}
                  >
                    <span className="text-2xl">{friend.avatar}</span>
                    <OnlineStatusIndicator 
                      isOnline={friend.online}
                      size="sm"
                      className="absolute bottom-0 right-0"
                    />
                    {friend.hasNewMessages && selectedFriend?.id !== friend.id && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
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
                  <div className="h-full w-60 bg-background shadow-xl rounded-r-xl flex flex-col pt-16 p-4 relative max-h-screen overflow-hidden" style={{ pointerEvents: 'auto' }}>
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
                            <div className="relative">
                              <span className="text-2xl">{friend.avatar}</span>
                              <OnlineStatusIndicator 
                                isOnline={friend.online}
                                size="sm"
                                className="absolute -bottom-1 -right-1"
                              />
                              {friend.hasNewMessages && selectedFriend?.id !== friend.id && (
                                <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                  {friend.unreadCount && friend.unreadCount > 0 && (
                                    <span className="text-[8px] text-white font-bold">
                                      {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold text-sm truncate ${friend.hasNewMessages && selectedFriend?.id !== friend.id ? 'text-primary' : ''}`}>
                                  {friend.name}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">{friend.time}</span>
                                  {friend.hasNewMessages && selectedFriend?.id !== friend.id && (
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-xs truncate ${friend.hasNewMessages && selectedFriend?.id !== friend.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                {friend.lastMessage}
                              </p>
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
            <div className="hidden md:flex md:flex-col md:w-72 h-full bg-background shadow-playful rounded-xl p-4 z-10 max-h-full overflow-hidden">
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
                        <OnlineStatusIndicator 
                          isOnline={friend.online}
                          size="md"
                          className="absolute -bottom-1 -right-1"
                        />
                        {friend.unreadCount !== undefined && friend.unreadCount > 0 && selectedFriend?.id !== friend.id && (
                          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-background animate-pulse flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">
                              {friend.unreadCount > 9 ? '9+' : friend.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold text-sm truncate ${friend.hasNewMessages && selectedFriend?.id !== friend.id ? 'text-primary' : ''}`}>
                            {friend.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{friend.time}</span>
                            {friend.hasNewMessages && selectedFriend?.id !== friend.id && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>
                        <p className={`text-xs truncate ${friend.hasNewMessages && selectedFriend?.id !== friend.id ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {friend.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex min-h-0 max-h-full">
              <Card className="flex-1 shadow-playful flex flex-col h-full max-h-full overflow-hidden">
                {selectedFriend ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-border flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="relative">
                        <div className="text-3xl">{selectedFriend.avatar}</div>
                        <OnlineStatusIndicator 
                          isOnline={selectedFriend.online}
                          size="md"
                          className="absolute -bottom-1 -right-1"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-lg">{selectedFriend.name}</h2>
                          {wsConnected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full" title="Real-time connected">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                              Live
                            </span>
                          )}
                          {!wsConnected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-orange-700 bg-orange-100 rounded-full" title="Using HTTP polling">
                              <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                              Offline
                            </span>
                          )}
                          {newMessageNotification?.friendId === selectedFriend.id && (
                            <div className="animate-bounce">
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                New!
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <OnlineStatusIndicator 
                            isOnline={selectedFriend.online}
                            size="sm"
                            showText={true}
                            lastSeen={friendsStatusResponse?.friendsStatus?.find(s => s.userId === selectedFriend.id)?.lastSeen}
                          />
                          {friendTyping === selectedFriend.id && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                              <span>typing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                      <ScrollArea className="flex-1 p-4 h-full">
                        {messagesLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messagesResponse?.data?.messages?.map((message: ChatMessage, index: number) => {
                              const isCurrentUser = message.senderId !== selectedFriend.id;
                              const isLastMessage = index === messagesResponse.data.messages.length - 1;

                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${
                                    isLastMessage ? 'animate-in slide-in-from-bottom-2 duration-300' : ''
                                  }`}
                                >
                                  {!isCurrentUser && (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-2 mt-auto">
                                      <span className="text-sm">{selectedFriend.avatar}</span>
                                    </div>
                                  )}
                                  <div
                                    className={`max-w-[70%] p-3 rounded-2xl transition-all duration-200 hover:scale-105 ${
                                      isCurrentUser
                                        ? "gradient-primary text-primary-foreground rounded-br-md"
                                        : "bg-muted rounded-bl-md"
                                    }`}
                                  >
                                    <p className={`text-sm ${message.messageType === 'EMOJI' ? 'text-2xl' : ''}`}>
                                      {message.messageText}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span
                                        className={`text-xs ${
                                          isCurrentUser
                                            ? "text-primary-foreground/80"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {new Date(message.createdAt).toLocaleTimeString([], { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                      {isCurrentUser && (
                                        <span className="text-xs text-primary-foreground/80 ml-2">
                                          {message.isRead ? '✓✓' : '✓'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isCurrentUser && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2 mt-auto">
                                      <span className="text-sm">👤</span>
                                    </div>
                                  )}
                                </div>
                              );
                            }) || (
                              <div className="text-center text-muted-foreground py-8">
                                <div className="text-4xl mb-2 animate-bounce">💬</div>
                                <p>Start your conversation by sending a message!</p>
                                <p className="text-xs mt-2 opacity-60">Messages will appear here in real-time</p>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border flex-shrink-0 bg-gradient-to-r from-transparent to-primary/5">
                      {isTyping && (
                        <div className="mb-2 text-xs text-muted-foreground flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span>You are typing...</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => setShowEmojiPicker((v) => !v)}
                            className="hover:scale-110 transition-transform duration-200"
                            data-emoji-button
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                          {showEmojiPicker && (
                            <div 
                              className="absolute left-0 bottom-12 z-50 bg-background border rounded-xl shadow-lg p-2 w-72 max-w-xs grid grid-cols-8 gap-2 max-h-40 overflow-y-auto animate-in slide-in-from-bottom-2 duration-200"
                              data-emoji-picker
                            >
                              {emojiList.map((emoji) => (
                                <button
                                  key={emoji}
                                  className="text-2xl hover:bg-muted rounded-lg p-1 focus:outline-none hover:scale-125 transition-all duration-150"
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
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          autoComplete="off"
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="gradient-primary hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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