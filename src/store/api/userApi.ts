import { apiSlice } from './apiSlice';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  mobile: string;
  isVerified: boolean;
  createdAt: string;
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

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Profile endpoints
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => `/users/${userId}/profile`,
      providesTags: ['User'],
    }),
    
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}/profile`,
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

    // Friends endpoints
    getFriends: builder.query<Friend[], string>({
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

    removeFriend: builder.mutation<void, { userId: string; friendshipId: string }>({
      query: ({ userId, friendshipId }) => ({
        url: `/users/${userId}/friends/${friendshipId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
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
    }),

    submitFeedback: builder.mutation<void, { userId: string; type: string; subject: string; message: string }>({
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
  useUpdateUserProfileMutation,
  useUpdatePasswordMutation,
  useGetFriendsQuery,
  useSendFriendRequestMutation,
  useRemoveFriendMutation,
  useGetExamScoresQuery,
  useSaveExamScoreMutation,
  useGetFeedbacksQuery,
  useSubmitFeedbackMutation,
  useGetDashboardStatsQuery,
} = userApi;