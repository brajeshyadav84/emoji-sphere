import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '@/store';

export interface ChatMessage {
  id?: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  messageType: 'TEXT' | 'EMOJI' | 'IMAGE' | 'FILE';
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TypingIndicator {
  userId: number;
  conversationId: number;
  isTyping: boolean;
}

export interface MessageReadReceipt {
  conversationId: number;
  userId: number;
  messageIds: number[];
}

type MessageCallback = (message: ChatMessage) => void;
type TypingCallback = (typing: TypingIndicator) => void;
type ReadReceiptCallback = (receipt: MessageReadReceipt) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private messageCallbacks: Map<number, MessageCallback[]> = new Map();
  private typingCallbacks: Map<number, TypingCallback[]> = new Map();
  private readReceiptCallbacks: ReadReceiptCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private userId: number | null = null;
  private subscribedConversations: Set<number> = new Set();

  constructor() {
    // Get userId from Redux store
    this.updateUserId();
  }

  /**
   * Update userId from Redux store
   * Call this method when user authentication state changes
   */
  private updateUserId(): void {
    const state = store.getState();
    const userIdStr = state.auth?.user?.id;
    this.userId = userIdStr ? parseInt(userIdStr.toString(), 10) : null;
  }

  /**
   * Initialize WebSocket connection with SockJS and STOMP
   */
  connect(): Promise<void> {
    // Ensure we have the latest userId
    this.updateUserId();
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      if (!this.userId) {
        console.warn('Cannot connect to WebSocket: User not authenticated');
        reject(new Error('User not authenticated'));
        return;
      }

      const API_BASE_URL = 'http://localhost:8081';
      const socket = new SockJS(`${API_BASE_URL}/ws`);

      this.client = new Client({
        webSocketFactory: () => socket as any,
        connectHeaders: {
          userId: this.userId.toString(),
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('✅ WebSocket Connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionCallbacks(true);
          
          // Subscribe to user's personal queue for incoming messages
          this.subscribeToUserQueue();
          
          // Resubscribe to all previously subscribed conversations
          this.subscribedConversations.forEach(conversationId => {
            this.subscribeToConversation(conversationId);
          });

          resolve();
        },
        onStompError: (frame) => {
          console.error('❌ STOMP Error:', frame);
          this.connected = false;
          this.notifyConnectionCallbacks(false);
          reject(new Error(frame.headers.message || 'STOMP connection error'));
        },
        onDisconnect: () => {
          console.log('🔌 WebSocket Disconnected');
          this.connected = false;
          this.notifyConnectionCallbacks(false);
          this.attemptReconnect();
        },
        onWebSocketClose: () => {
          console.log('🔌 WebSocket Closed');
          this.connected = false;
          this.notifyConnectionCallbacks(false);
        },
      });

      this.client.activate();
    });
  }

  /**
   * Subscribe to user's personal message queue
   */
  private subscribeToUserQueue(): void {
    if (!this.client || !this.userId) return;

    this.client.subscribe(`/user/${this.userId}/queue/messages`, (message) => {
      try {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        console.log('📨 Received message:', chatMessage);
        this.notifyMessageCallbacks(chatMessage.conversationId, chatMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    // Subscribe to typing indicators
    this.client.subscribe(`/user/${this.userId}/queue/typing`, (message) => {
      try {
        const typing: TypingIndicator = JSON.parse(message.body);
        console.log('⌨️ Typing indicator:', typing);
        this.notifyTypingCallbacks(typing.conversationId, typing);
      } catch (error) {
        console.error('Error parsing typing indicator:', error);
      }
    });

    // Subscribe to read receipts
    this.client.subscribe(`/user/${this.userId}/queue/read`, (message) => {
      try {
        const receipt: MessageReadReceipt = JSON.parse(message.body);
        console.log('✓✓ Read receipt:', receipt);
        this.notifyReadReceiptCallbacks(receipt);
      } catch (error) {
        console.error('Error parsing read receipt:', error);
      }
    });
  }

  /**
   * Subscribe to a specific conversation
   */
  subscribeToConversation(conversationId: number): void {
    if (!this.client || !this.connected) {
      console.warn('Cannot subscribe: Client not connected');
      return;
    }

    if (this.subscribedConversations.has(conversationId)) {
      console.log(`Already subscribed to conversation ${conversationId}`);
      return;
    }

    this.client.subscribe(`/topic/conversation/${conversationId}`, (message) => {
      try {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        console.log(`📨 Conversation ${conversationId} message:`, chatMessage);
        this.notifyMessageCallbacks(conversationId, chatMessage);
      } catch (error) {
        console.error('Error parsing conversation message:', error);
      }
    });

    this.subscribedConversations.add(conversationId);
    console.log(`✅ Subscribed to conversation ${conversationId}`);
  }

  /**
   * Unsubscribe from a conversation
   */
  unsubscribeFromConversation(conversationId: number): void {
    this.subscribedConversations.delete(conversationId);
    console.log(`❌ Unsubscribed from conversation ${conversationId}`);
  }

  /**
   * Send a chat message
   */
  sendMessage(message: ChatMessage): void {
    if (!this.client || !this.connected) {
      console.error('Cannot send message: Client not connected');
      throw new Error('WebSocket not connected');
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });

    console.log('📤 Sent message:', message);
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: number, isTyping: boolean): void {
    if (!this.client || !this.connected || !this.userId) {
      return;
    }

    const typingIndicator: TypingIndicator = {
      userId: this.userId,
      conversationId,
      isTyping,
    };

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(typingIndicator),
    });

    console.log('⌨️ Sent typing indicator:', typingIndicator);
  }

  /**
   * Send read receipt
   */
  sendReadReceipt(conversationId: number, messageIds: number[]): void {
    if (!this.client || !this.connected || !this.userId) {
      return;
    }

    const receipt: MessageReadReceipt = {
      conversationId,
      userId: this.userId,
      messageIds,
    };

    this.client.publish({
      destination: '/app/chat.read',
      body: JSON.stringify(receipt),
    });

    console.log('✓✓ Sent read receipt:', receipt);
  }

  /**
   * Register callback for new messages in a conversation
   */
  onMessage(conversationId: number, callback: MessageCallback): () => void {
    if (!this.messageCallbacks.has(conversationId)) {
      this.messageCallbacks.set(conversationId, []);
    }
    this.messageCallbacks.get(conversationId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.messageCallbacks.get(conversationId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Register callback for typing indicators in a conversation
   */
  onTyping(conversationId: number, callback: TypingCallback): () => void {
    if (!this.typingCallbacks.has(conversationId)) {
      this.typingCallbacks.set(conversationId, []);
    }
    this.typingCallbacks.get(conversationId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.typingCallbacks.get(conversationId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Register callback for read receipts
   */
  onReadReceipt(callback: ReadReceiptCallback): () => void {
    this.readReceiptCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.readReceiptCallbacks.indexOf(callback);
      if (index > -1) {
        this.readReceiptCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Register callback for connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);

    // Immediately notify with current status
    callback(this.connected);

    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify message callbacks
   */
  private notifyMessageCallbacks(conversationId: number, message: ChatMessage): void {
    const callbacks = this.messageCallbacks.get(conversationId);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  /**
   * Notify typing callbacks
   */
  private notifyTypingCallbacks(conversationId: number, typing: TypingIndicator): void {
    const callbacks = this.typingCallbacks.get(conversationId);
    if (callbacks) {
      callbacks.forEach(callback => callback(typing));
    }
  }

  /**
   * Notify read receipt callbacks
   */
  private notifyReadReceiptCallbacks(receipt: MessageReadReceipt): void {
    this.readReceiptCallbacks.forEach(callback => callback(receipt));
  }

  /**
   * Notify connection callbacks
   */
  private notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.connected) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscribedConversations.clear();
      this.notifyConnectionCallbacks(false);
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current user ID
   */
  getUserId(): number | null {
    return this.userId;
  }

  /**
   * Update user ID (for re-authentication)
   */
  setUserId(userId: number): void {
    this.userId = userId;
    // Reconnect with new user ID
    if (this.connected) {
      this.disconnect();
      this.connect();
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
