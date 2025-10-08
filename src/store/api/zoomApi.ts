import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:8081/api';

// Define the response types
interface ZoomSignatureResponse {
  signature: string;
  error?: string;
}

interface PortalMeeting {
  meetingId: string;
  originalMeetingId?: string;
  meetingName: string;
  zoomJoinUrl?: string;
  password?: string;
  hostUrl: string;
  participantUrl: string;
  createdAt: string;
  source: 'zoom_portal' | 'generated';
  scheduledDate?: string;
  scheduledTime?: string;
  isActive?: boolean;
}

interface PortalMeetingRequest {
  meetingId: string;
  meetingName?: string;
  zoomJoinUrl?: string;
  password?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isActive?: boolean;
}

interface PortalMeetingsResponse {
  success: boolean;
  meetings: PortalMeeting[];
  count: number;
  source: string;
}

interface PortalMeetingResponse {
  success: boolean;
  meeting: PortalMeeting;
  found?: boolean;
  message?: string;
}

interface JoinUrlsResponse {
  success: boolean;
  meetingId: string;
  originalMeetingId: string;
  hostUrl: string;
  participantUrl: string;
  meetingName: string;
  zoomJoinUrl?: string;
  password?: string;
  source: 'stored' | 'generated';
}

interface PortalStatusResponse {
  success: boolean;
  service: string;
  status: string;
  sdkConfigured: boolean;
  storedMeetings: number;
  frontendUrl: string;
  workflow: string[];
  endpoints: string[];
}

// Online Meeting interfaces
interface OnlineMeetingJoinRequest {
  meetingUrl: string;
  userName: string;
  userEmail?: string;
  role: number; // 0 for participant, 1 for host
  password?: string;
}

interface OnlineMeetingJoinResponse {
  success: boolean;
  sdkKey?: string;
  signature?: string;
  meetingNumber?: string;
  password?: string;
  userName?: string;
  userEmail?: string;
  role?: number;
  error?: string;
}

interface OnlineMeetingInfoResponse {
  success: boolean;
  meetingNumber?: string;
  password?: string;
  error?: string;
}

export const zoomApi = createApi({
  reducerPath: 'zoomApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['ZoomSignature', 'PortalMeeting'],
  endpoints: (builder) => ({
    // Get Zoom signature for joining meetings
    getZoomSignature: builder.query<ZoomSignatureResponse, { meetingNumber: string; role: number }>({
      query: ({ meetingNumber, role }) => ({
        url: `/zoom-signature`,
        params: {
          meetingNumber,
          role,
          videoWebRtcMode: 1, // Enable WebRTC mode for better performance
        },
      }),
      providesTags: ['ZoomSignature'],
      keepUnusedDataFor: 300, // 5 minutes in seconds
    }),

    // Store a meeting created in Zoom portal
    storePortalMeeting: builder.mutation<PortalMeetingResponse, PortalMeetingRequest>({
      query: (meetingData) => ({
        url: '/zoom/portal-meetings',
        method: 'POST',
        body: meetingData,
      }),
      invalidatesTags: ['PortalMeeting'],
    }),

    // Get all stored portal meetings
    getPortalMeetings: builder.query<PortalMeetingsResponse, void>({
      query: () => '/zoom/portal-meetings',
      providesTags: ['PortalMeeting'],
    }),

    // Get specific portal meeting
    getPortalMeeting: builder.query<PortalMeetingResponse, string>({
      query: (meetingId) => `/zoom/portal-meetings/${meetingId}`,
      providesTags: ['PortalMeeting'],
    }),

    // Get join URLs for any meeting ID
    getJoinUrls: builder.query<JoinUrlsResponse, string>({
      query: (meetingId) => `/zoom/join-urls/${meetingId}`,
      providesTags: ['PortalMeeting'],
    }),

    // Delete stored portal meeting
    deletePortalMeeting: builder.mutation<{ success: boolean; message: string }, string>({
      query: (meetingId) => ({
        url: `/zoom/portal-meetings/${meetingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PortalMeeting'],
    }),

    // Get portal service status
    getPortalStatus: builder.query<PortalStatusResponse, void>({
      query: () => '/zoom/portal-status',
    }),

    // Clear all portal meetings (for testing)
    clearAllPortalMeetings: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/zoom/portal-meetings',
        method: 'DELETE',
      }),
      invalidatesTags: ['PortalMeeting'],
    }),

    // Online Meeting endpoints
    joinOnlineMeeting: builder.mutation<OnlineMeetingJoinResponse, OnlineMeetingJoinRequest>({
      query: (meetingData) => ({
        url: '/onlinemeeting/join',
        method: 'POST',
        body: meetingData,
      }),
    }),

    getOnlineMeetingInfo: builder.query<OnlineMeetingInfoResponse, string>({
      query: (meetingUrl) => ({
        url: '/onlinemeeting/meeting-info',
        params: { meetingUrl },
      }),
    }),

    // Zoom Portal API endpoints (fetch from Zoom directly)
    getZoomPortalMeetings: builder.query<PortalMeetingsResponse, void>({
      query: () => '/zoom-portal/meetings',
      providesTags: ['PortalMeeting'],
    }),

    getZoomPortalMeetingDetails: builder.query<PortalMeetingResponse, string>({
      query: (meetingId) => `/zoom-portal/meetings/${meetingId}`,
      providesTags: ['PortalMeeting'],
    }),

    syncZoomPortalMeetings: builder.mutation<any, void>({
      query: () => ({
        url: '/zoom-portal/sync',
        method: 'GET',
      }),
      invalidatesTags: ['PortalMeeting'],
    }),

    getZoomPortalStatus: builder.query<any, void>({
      query: () => '/zoom-portal/status',
    }),
  }),
});

export const { 
  useGetZoomSignatureQuery,
  useStorePortalMeetingMutation,
  useGetPortalMeetingsQuery,
  useGetPortalMeetingQuery,
  useGetJoinUrlsQuery,
  useDeletePortalMeetingMutation,
  useGetPortalStatusQuery,
  useClearAllPortalMeetingsMutation,
  useJoinOnlineMeetingMutation,
  useGetOnlineMeetingInfoQuery,
  useGetZoomPortalMeetingsQuery,
  useGetZoomPortalMeetingDetailsQuery,
  useSyncZoomPortalMeetingsMutation,
  useGetZoomPortalStatusQuery,
} = zoomApi;