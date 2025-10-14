import { apiSlice } from './apiSlice';

export interface UserPresenceStatus {
  userId: number;
  isOnline: boolean;
  lastSeen: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
}

export interface FriendsPresenceResponse {
  friendsStatus: UserPresenceStatus[];
}

export const presenceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Set current user as online
    setUserOnline: builder.mutation<void, void>({
      query: () => ({
        url: '/user/status/online',
        method: 'POST',
      }),
      invalidatesTags: ['Presence'],
    }),

    // Set current user as offline
    setUserOffline: builder.mutation<void, void>({
      query: () => ({
        url: '/user/status/offline',
        method: 'POST',
      }),
      invalidatesTags: ['Presence'],
    }),

    // Get a specific user's status
    getUserStatus: builder.query<UserPresenceStatus, number>({
      query: (userId) => `/user/status/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'Presence', id: userId },
      ],
    }),

    // Get all friends' online status
    getFriendsStatus: builder.query<FriendsPresenceResponse, void>({
      query: () => '/friends/status',
      providesTags: ['Presence'],
      // Poll every 30 seconds to update online status
    }),

    // Update user status (online, away, busy, etc.)
    updateUserStatus: builder.mutation<void, { status: 'ONLINE' | 'AWAY' | 'BUSY' }>({
      query: (body) => ({
        url: '/user/status/update',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Presence'],
    }),

    // Send heartbeat to keep user online
    sendHeartbeat: builder.mutation<void, void>({
      query: () => ({
        url: '/user/heartbeat',
        method: 'POST',
      }),
      invalidatesTags: ['Presence'],
    }),
  }),
});

export const {
  useSetUserOnlineMutation,
  useSetUserOfflineMutation,
  useGetUserStatusQuery,
  useGetFriendsStatusQuery,
  useUpdateUserStatusMutation,
  useSendHeartbeatMutation,
} = presenceApi;