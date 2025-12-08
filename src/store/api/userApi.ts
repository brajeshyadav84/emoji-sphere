import { apiSlice } from './apiSlice';

export interface UserProfile {
  id: string;
  mobileNumber?: string;
  fullName: string;
  dob: string;
  gender: string;
  country: string;
  schoolName?: string;
  email?: string;
  isVerified: boolean;
  isActive: boolean;
  role?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Friend {
  id: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  friendProfile: {
    name: string;
    age: number;
  };
}

export interface FriendshipResponse {
  id: number;
  user1Id: number;
  user2Id: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  requesterId: number;
  responderId?: number;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  
  // User details
  user1?: UserBasicInfo;
  user2?: UserBasicInfo;
  requester?: UserBasicInfo;
  responder?: UserBasicInfo;
  
  // Helper fields
  otherUserId: number;
  otherUser?: UserBasicInfo;
  canRespond: boolean;
  isSentByCurrentUser: boolean;
}

export interface UserBasicInfo {
  id: number;
  fullName: string;
  email?: string;
  mobileNumber?: string;
  country?: string;
  schoolName?: string;
  age?: number;
  dob?: string;
  gender?: string;
  isActive: boolean;
  // Online status fields
  isOnline?: boolean;
  lastSeen?: string;
  onlineStatus?: string;
}

export interface FriendsListResponse {
  friends: FriendshipResponse[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FriendshipStatus {
  areFriends: boolean;
  friendshipExists: boolean;
  friendship?: {
    id: number;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
    canRespond: boolean;
    isSentByCurrentUser: boolean;
  };
}

export interface UserGroup {
  id: number;
  name: string;
  description: string;
  privacy: string;
  memberCount: number;
  isUserMember: boolean;
  isUserAdmin: boolean;
  createdByName?: string;
}

export interface ExamScore {
  id: string;
  examType: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface Feedback {
  id: string;
  type: 'suggestion' | 'bug' | 'feature' | 'general';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
}

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Profile endpoints
    getUserProfile: builder.query<ApiResponse<UserProfile>, string>({
      query: (userId) => `/user/profile/${userId}`,
      providesTags: ['User'],
    }),

    // Get current user profile (authenticated user)
    getCurrentUserProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => `/user/profile`,
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<ApiResponse<UserProfile>, Partial<UserProfile>>({
      query: (patch) => ({
        url: `/user/profile`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['User'],
    }),

    updatePassword: builder.mutation<void, { userId: string; newPassword: string }>({
      query: ({ userId, newPassword }) => ({
        url: `/users/${userId}/password`,
        method: 'PUT',
        body: { newPassword },
      }),
    }),

    // Friends endpoints - using friendship API
    getFriends: builder.query<ApiResponse<FriendsListResponse>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 }) => `/friendships/friends?page=${page}&size=${size}`,
      providesTags: ['Friendship'],
    }),

    getFriendsList: builder.query<ApiResponse<Friend[]>, string>({
      query: (userId) => `/users/${userId}/friends`,
      providesTags: ['User'],
    }),

    sendFriendRequest: builder.mutation<void, { userId: string; friendId: string }>({
      query: ({ userId, friendId }) => ({
        url: `/users/${userId}/friends`,
        method: 'POST',
        body: { friendId },
      }),
      invalidatesTags: ['User'],
    }),

    removeFriend: builder.mutation<void, { friendId: string }>({
      query: ({ friendId }) => ({
        url: `/friendships/remove/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friendship'],
    }),

    // Friendship status for user profile
    getFriendshipStatus: builder.query<FriendshipStatus, { userId: string }>({
      query: ({ userId }) => `/friendships/status/${userId}`,
      providesTags: ['Friendship'],
      transformResponse: (response: any) => {
        // Handle backend response format
        if (response?.data?.areFriends !== undefined) {
          return response.data;
        }
        return { areFriends: false, friendshipExists: false };
      },
    }),

    // Send friend request using friendship API
    sendFriendRequestById: builder.mutation<void, { targetUserId: string }>({
      query: ({ targetUserId }) => ({
        url: '/friendships/send-request',
        method: 'POST',
        body: { targetUserId: parseInt(targetUserId) },
      }),
      invalidatesTags: ['Friendship', 'User'],
    }),

    // Respond to friend request
    respondToFriendRequest: builder.mutation<void, { friendshipId: number; response: string }>({
      query: ({ friendshipId, response }) => ({
        url: '/friendships/respond',
        method: 'POST',
        body: { friendshipId, response },
      }),
      invalidatesTags: ['Friendship', 'User'],
    }),

    // Cancel friend request (remove pending friendship)
    cancelFriendRequest: builder.mutation<void, { friendId: string }>({
      query: ({ friendId }) => ({
        url: `/friendships/remove/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friendship', 'User'],
    }),

    // Get user groups
    getUserGroups: builder.query<UserGroup[], string>({
      query: (userId) => `/groups/my-groups`, // Use existing endpoint that gets current user's groups
      providesTags: ['User'],
      transformResponse: (response: { success: boolean; data: UserGroup[] }) => {
        return response?.data || [];
      },
    }),

    // Exam scores endpoints
    getExamScores: builder.query<ExamScore[], string>({
      query: (userId) => `/users/${userId}/exam-scores`,
      providesTags: ['User'],
    }),

    saveExamScore: builder.mutation<void, { userId: string; examType: string; score: number; totalQuestions: number }>({
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/exam-scores`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Feedback endpoints
    getFeedbacks: builder.query<Feedback[], string>({
      query: (userId) => `/users/${userId}/feedback`,
      providesTags: ['User'],
      transformResponse: (response: ApiResponse<Feedback[]>) => response?.data || [],
    }),

    submitFeedback: builder.mutation<ApiResponse<Feedback>, { userId: string; type: string; subject: string; message: string }>( {
      query: ({ userId, ...body }) => ({
        url: `/users/${userId}/feedback`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Dashboard stats
    getDashboardStats: builder.query<{
      totalFriends: number;
      totalExams: number;
      averageScore: number;
      memberSince: string;
    }, string>({
      query: (userId) => `/users/${userId}/dashboard-stats`,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useGetCurrentUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdatePasswordMutation,
  useGetFriendsQuery,
  useGetFriendsListQuery,
  useSendFriendRequestMutation,
  useRemoveFriendMutation,
  useGetExamScoresQuery,
  useSaveExamScoreMutation,
  useGetFeedbacksQuery,
  useSubmitFeedbackMutation,
  useGetDashboardStatsQuery,
  useGetFriendshipStatusQuery,
  useSendFriendRequestByIdMutation,
  useRespondToFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetUserGroupsQuery,
} = userApi;