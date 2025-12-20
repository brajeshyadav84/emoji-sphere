import { apiSlice } from './apiSlice';

export interface TeacherDetails {
  userId: number;
  teachingExperience: number;
  gradesSubjects: Array<{
    grade: string;
    subject: string;
    pricing: number;
  }>;
}

export const teacherApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of teachers
    getTeacherList: builder.query<TeacherDetails[], { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => ({
        url: '/teachers/allDetails',
        method: 'GET',
      })
    }),
    updateTeacherDetails: builder.mutation<void, TeacherDetails>({
      query: (teacherDetails) => ({
        url: '/teachers/details',
        method: 'POST',
        body: teacherDetails,
      }),
      invalidatesTags: ['TeacherMeetings'],
    }),

    getTeacherDetails: builder.query<TeacherDetails, number>({
      query: (id) => `/teachers/details/${id}`,
      providesTags: (result, error, id) => [{ type: 'TeacherMeetings', id }],
    }),
  }),
});

export const { useUpdateTeacherDetailsMutation, useGetTeacherDetailsQuery, useGetTeacherListQuery } = teacherApi;