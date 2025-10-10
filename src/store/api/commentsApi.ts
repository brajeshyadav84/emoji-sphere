import { apiSlice } from './apiSlice';

// Types for the Comments API
export interface CommentRequest {
  content: string;
  parentCommentId?: number;
}

export interface UserResponse {
  id: string;
  mobile: string;
  name: string;
  email?: string;
  profilePictureUrl?: string;
}

export interface CommentResponse {
  id: number;
  commentText: string;
  user: UserResponse;
  postId: number;
  parentCommentId?: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentResponse[];
}

export interface CommentsResponse {
  content: CommentResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface LikeResponse {
  liked: boolean;
  message: string;
}

// Extended API slice with comments endpoints
export const commentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get comments for a post
    getCommentsByPost: builder.query<CommentsResponse, {
      postId: number;
      page?: number;
      size?: number;
    }>({
      query: ({ postId, page = 0, size = 10 }) => ({
        url: `/posts/${postId}/comments`,
        params: { page, size },
      }),
      providesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        'Comment'
      ],
    }),

    // Create a comment
    createComment: builder.mutation<CommentResponse, {
      postId: number;
      data: CommentRequest;
    }>({
      query: ({ postId, data }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Post', id: postId },
        'Comment'
      ],
    }),

    // Update a comment
    updateComment: builder.mutation<CommentResponse, {
      commentId: number;
      data: CommentRequest;
    }>({
      query: ({ commentId, data }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Comment'],
    }),

    // Delete a comment
    deleteComment: builder.mutation<void, number>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comment'],
    }),

    // Get replies for a comment
    getReplies: builder.query<CommentResponse[], number>({
      query: (parentCommentId) => `/comments/${parentCommentId}/replies`,
      providesTags: ['Comment'],
    }),

    // Toggle like on a comment
    toggleCommentLike: builder.mutation<LikeResponse, number>({
      query: (commentId) => ({
        url: `/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Comment'],
    }),

    // Toggle like on a post (moved from postsApi for consistency)
    togglePostLike: builder.mutation<LikeResponse, number>({
      query: (postId) => ({
        url: `/likes/posts/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetCommentsByPostQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetRepliesQuery,
  useToggleCommentLikeMutation,
  useTogglePostLikeMutation,
} = commentsApi;