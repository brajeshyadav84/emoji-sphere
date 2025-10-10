import { apiSlice } from './apiSlice';

// Types for group-related API calls
export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  privacy: 'public' | 'private';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export interface GroupPostResponse {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    mobile: string;
  };
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
}

export interface GroupPostsResponse {
  content: GroupPostResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface CreateGroupPostRequest {
  content: string;
  groupId: number;
}

// Extended API slice with group endpoints
export const groupsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get group details
    getGroupById: builder.query<GroupResponse, number>({
      query: (id) => `/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),

    // Get posts for a specific group
    getGroupPosts: builder.query<GroupPostsResponse, {
      groupId: number;
      page?: number;
      size?: number;
    }>({
      query: ({ groupId, page = 0, size = 10 }) => ({
        url: `/groups/${groupId}/posts`,
        params: { page, size },
      }),
      providesTags: (result, error, { groupId }) => [
        { type: 'Post', id: `GROUP_${groupId}` },
      ],
    }),

    // Create a post in a group
    createGroupPost: builder.mutation<GroupPostResponse, CreateGroupPostRequest>({
      query: ({ groupId, content }) => ({
        url: `/groups/${groupId}/posts`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: 'Post', id: `GROUP_${groupId}` },
      ],
    }),

    // Get all groups
    getGroups: builder.query<GroupResponse[], void>({
      query: () => '/groups',
      providesTags: ['Group'],
    }),

    // Join a group
    joinGroup: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `/groups/${groupId}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, groupId) => [
        { type: 'Group', id: groupId },
      ],
    }),

    // Leave a group
    leaveGroup: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `/groups/${groupId}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, groupId) => [
        { type: 'Group', id: groupId },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetGroupByIdQuery,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useGetGroupsQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
} = groupsApi;