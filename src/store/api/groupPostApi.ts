import { apiSlice } from './apiSlice';
import type { ApiResponse, LikeResponse } from './commentsApi';

export interface GroupPost {
  id: number;
  content: string;
  author: {
    id: string;
    fullName: string;
    name: string;
    mobile: string;
    email: string;
    age: number;
    country: string;
    gender: string;
    isVerified: boolean;
    role: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
}

export interface GroupPostsResponse {
  content: GroupPost[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreateGroupPostRequest {
  title?: string;
  content: string;
  emojiContent?: string;
  imageUrl?: string;
  isPublic?: boolean;
  categoryId?: number;
  tags?: string[];
  groupId: number;
}

export const groupPostApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllGroupPosts: builder.query<GroupPostsResponse, {groupId: number, page?: number; size?: number }>({
      query: ({ groupId, page = 0, size = 20 }) => ({
        url: `/group-posts/group/${groupId}`,
        params: { page, size },
      }),
      providesTags: ['Post'],
    }),
    shareGroupPost: builder.mutation<GroupPost, CreateGroupPostRequest>({
      query: (body) => ({
        url: '/group-posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post'],
    }),

    deleteGroupPost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/group-posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),
    // Like/Unlike a post
    groupToggleLikePost: builder.mutation<ApiResponse<LikeResponse>, number>({
      query: (postId) => ({
        url: `/group-posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),
  }),
});

export const { useGetAllGroupPostsQuery, useShareGroupPostMutation, useDeleteGroupPostMutation, useGroupToggleLikePostMutation } = groupPostApi;
