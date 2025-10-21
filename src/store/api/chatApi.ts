import { apiSlice } from './apiSlice';

// Chat Message Types
export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  messageType: 'TEXT' | 'EMOJI' | 'IMAGE' | 'FILE';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: UserBasicInfo;
  receiver?: UserBasicInfo;
}

export interface UserBasicInfo {
  id: number;
  fullName: string;
  gender: string;
  isActive: boolean;
}

export interface Conversation {
  id: number;
  userOneId: number;
  userTwoId: number;
  createdAt: string;
  updatedAt: string;
  otherUserId: number;
  otherUser?: UserBasicInfo;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  notificationsEnabled: boolean;
  archived: boolean;
  mutedUntil?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SendMessageRequest {
  receiverId: number;
  messageText: string;
  messageType?: 'TEXT' | 'EMOJI' | 'IMAGE' | 'FILE';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send a message
    sendMessage: builder.mutation<ApiResponse<ChatMessage>, SendMessageRequest>({
      query: (message) => ({
        url: '/chat/send',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Chat', 'Conversation'],
    }),

    // Get conversations list
    getConversations: builder.query<ApiResponse<ConversationListResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 20 }) => `/chat/conversations?page=${page}&size=${size}`,
      providesTags: ['Conversation'],
    }),

    // Get messages for a conversation
    getMessages: builder.query<ApiResponse<MessagesResponse>, { conversationId: number; page?: number; size?: number }>({
      query: ({ conversationId, page = 0, size = 50 }) => 
        `/chat/conversation/${conversationId}/messages?page=${page}&size=${size}`,
      providesTags: (result, error, { conversationId }) => [
        { type: 'Chat', id: conversationId },
      ],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<void, number>({
      query: (conversationId) => ({
        url: `/chat/conversation/${conversationId}/mark-read`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Chat', id: conversationId },
        'Conversation',
      ],
    }),

    // Get unread message count
    getUnreadMessageCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/chat/unread-count',
      providesTags: ['Chat'],
    }),

    // Block a user
    blockUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/chat/block/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat', 'Conversation'],
    }),

    // Unblock a user
    unblockUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/chat/unblock/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat', 'Conversation'],
    }),

    // Start a conversation with a friend
    startConversation: builder.mutation<{ conversationId: number }, number>({
      query: (friendId) => ({
        url: `/chat/start/${friendId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat', 'Conversation'],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
  useGetUnreadMessageCountQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useStartConversationMutation,
} = chatApi;