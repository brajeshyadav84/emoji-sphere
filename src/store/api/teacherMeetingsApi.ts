import { apiSlice } from './apiSlice';

export interface TeacherMeeting {
  id: string;
  teacherId: number;
  subjectTitle: string;
  subjectDescription: string;
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface TeacherMeetingRequest {
  subjectTitle: string;
  subjectDescription?: string;
  meetingUrl?: string;
  meetingId?: string;
  passcode?: string;
  startTime: string;
  endTime: string;
  timeZone: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export const teacherMeetingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all meetings for a teacher
    getAllMeetings: builder.query<ApiResponse<TeacherMeeting[]>, void>({
      query: () => '/teacher-meetings',
      transformResponse: (response: ApiResponse<TeacherMeeting[]>) => response,
      providesTags: ['TeacherMeetings'],
    }),

    // Get all public meetings (for students)
    getPublicMeetings: builder.query<ApiResponse<TeacherMeeting[]>, void>({
      query: () => '/teacher-meetings/public',
      transformResponse: (response: ApiResponse<TeacherMeeting[]>) => response,
      providesTags: ['TeacherMeetings'],
    }),

    // Get a single meeting by ID
    getMeetingById: builder.query<ApiResponse<TeacherMeeting>, number>({
      query: (id) => `/teacher-meetings/${id}`,
      transformResponse: (response: ApiResponse<TeacherMeeting>) => response,
      providesTags: (result, error, id) => [{ type: 'TeacherMeetings', id }],
    }),

    // Get upcoming meetings
    getUpcomingMeetings: builder.query<ApiResponse<TeacherMeeting[]>, void>({
      query: () => '/teacher-meetings/upcoming',
      transformResponse: (response: ApiResponse<TeacherMeeting[]>) => response,
      providesTags: ['TeacherMeetings'],
    }),

    // Get ongoing meetings
    getOngoingMeetings: builder.query<ApiResponse<TeacherMeeting[]>, void>({
      query: () => '/teacher-meetings/ongoing',
      transformResponse: (response: ApiResponse<TeacherMeeting[]>) => response,
      providesTags: ['TeacherMeetings'],
    }),

    // Get meetings by date range
    getMeetingsByDateRange: builder.query<
      ApiResponse<TeacherMeeting[]>,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: '/teacher-meetings/date-range',
        params: { startDate, endDate },
      }),
      transformResponse: (response: ApiResponse<TeacherMeeting[]>) => response,
      providesTags: ['TeacherMeetings'],
    }),

    // Create a new meeting
    createMeeting: builder.mutation<ApiResponse<TeacherMeeting>, TeacherMeetingRequest>({
      query: (meeting) => ({
        url: '/teacher-meetings',
        method: 'POST',
        body: meeting,
      }),
      transformResponse: (response: ApiResponse<TeacherMeeting>) => response,
      invalidatesTags: ['TeacherMeetings'],
    }),

    // Update a meeting
    updateMeeting: builder.mutation<
      ApiResponse<TeacherMeeting>,
      { id: number; meeting: TeacherMeetingRequest }
    >({
      query: ({ id, meeting }) => ({
        url: `/teacher-meetings/${id}`,
        method: 'PUT',
        body: meeting,
      }),
      transformResponse: (response: ApiResponse<TeacherMeeting>) => response,
      invalidatesTags: (result, error, { id }) => [
        { type: 'TeacherMeetings', id },
        'TeacherMeetings',
      ],
    }),

    // Delete a meeting
    deleteMeeting: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/teacher-meetings/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => response,
      invalidatesTags: ['TeacherMeetings'],
    }),
  }),
});

export const {
  useGetAllMeetingsQuery,
  useGetPublicMeetingsQuery,
  useGetMeetingByIdQuery,
  useGetUpcomingMeetingsQuery,
  useGetOngoingMeetingsQuery,
  useGetMeetingsByDateRangeQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
} = teacherMeetingsApi;
