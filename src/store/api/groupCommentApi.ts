import { apiSlice } from './apiSlice';

// Types for the Group Comments API
export interface GroupCommentRequest {
  content: string;
  parentCommentId?: number;
}

export interface GroupUserResponse {
  id: string;
  mobile: string;
  name: string;
  email?: string;
  profilePictureUrl?: string;
  gender?: string;
}

export interface GroupCommentResponse {
  id: number;
  commentText: string;
  user: GroupUserResponse;
  postId: number;
  parentCommentId?: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  replies: GroupCommentResponse[];
}

export interface GroupCommentsResponse {
  content: GroupCommentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface GroupLikeResponse {
  liked?: boolean;
  message?: string;
}

// Extended API slice with group comments endpoints
export const groupCommentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get comments for a group post
    getGroupCommentsByPost: builder.query<GroupCommentsResponse, {
      postId: number;
      page?: number;
      size?: number;
    }>({
      query: ({ postId, page = 0, size = 10 }) => ({
        url: `/group/posts/${postId}/comments`,
        params: { page, size },
      }),
      
    }),

    // Create a group comment
    createGroupComment: builder.mutation<GroupCommentResponse, {
      postId: number;
      data: GroupCommentRequest;
    }>({
      query: ({ postId, data }) => ({
        url: `/group/posts/${postId}/comments`,
        method: 'POST',
        body: data,
      }),
    }),

    // Update a group comment
    updateGroupComment: builder.mutation<GroupCommentResponse, {
      commentId: number;
      data: GroupCommentRequest;
    }>({
      query: ({ commentId, data }) => ({
        url: `/group/comments/${commentId}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Delete a group comment
    deleteGroupComment: builder.mutation<void, number>({
      query: (commentId) => ({
        url: `/group/comments/${commentId}`,
        method: 'DELETE',
      }),
    }),

    // Get replies for a group comment
    getGroupReplies: builder.query<GroupCommentResponse[], number>({
      query: (parentCommentId) => `/group/comments/${parentCommentId}/replies`,
      
    }),

    // Toggle like on a group comment
    toggleGroupCommentLike: builder.mutation<{liked: boolean; status: string; message: string}, number>({
      query: (commentId) => ({
        url: `/group/comments/${commentId}/like`,
        method: 'POST',
      }),
    }),

    // Toggle like on a group post
    toggleGroupPostLike: builder.mutation<{liked: boolean; status: string; message: string}, number>({
      query: (postId) => ({
        url: `/group/posts/${postId}/like`,
        method: 'POST',
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetGroupCommentsByPostQuery,
  useCreateGroupCommentMutation,
  useUpdateGroupCommentMutation,
  useDeleteGroupCommentMutation,
  useGetGroupRepliesQuery,
  useToggleGroupCommentLikeMutation,
  useToggleGroupPostLikeMutation,
} = groupCommentsApi;
