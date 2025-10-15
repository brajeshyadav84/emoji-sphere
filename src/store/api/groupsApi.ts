import { apiSlice } from './apiSlice';

// Types for group-related API calls
export interface GroupResponse {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  createdById: string;
  createdByName?: string;
  createdByMobile?: string;
  createdAt: string;
  updatedAt?: string;
  memberCount?: number;
  adminCount?: number;
  isUserMember?: boolean;
  isUserAdmin?: boolean;
}

export interface CreateGroupRequest {
  name: string;
  emoji?: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
}

export interface UpdateGroupRequest {
  name?: string;
  emoji?: string;
  description?: string;
  privacy?: 'PUBLIC' | 'PRIVATE';
}

export interface GroupJoinRequest {
  groupId: number;
}

export interface GroupMemberResponse {
  id: number;
  groupId: number;
  groupName?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  age?: number;
  status: 'ADMIN' | 'MEMBER';
  joinedAt: string;
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
    // Create a new group
    createGroup: builder.mutation<{ success: boolean; message: string; data: GroupResponse }, CreateGroupRequest>({
      query: (body) => ({
        url: '/groups',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Group'],
    }),

    // Update group
    updateGroup: builder.mutation<{ success: boolean; message: string; data: GroupResponse }, { id: number } & UpdateGroupRequest>({
      query: ({ id, ...body }) => ({
        url: `/groups/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Group', id }],
    }),

    // Delete group
    deleteGroup: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Group', id }],
    }),

    // Get group details
    getGroupById: builder.query<{ success: boolean; data: GroupResponse }, number>({
      query: (id) => `/groups/${id}`,
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),

    // Get user's groups
    getUserGroups: builder.query<{ success: boolean; data: GroupResponse[] }, void>({
      query: () => '/groups/my-groups',
      providesTags: ['Group'],
    }),

    // Get groups created by user
    getCreatedGroups: builder.query<{ success: boolean; data: GroupResponse[] }, void>({
      query: () => '/groups/created-by-me',
      providesTags: ['Group'],
    }),

    // Search groups
    searchGroups: builder.query<{ success: boolean; data: any }, { q?: string; page?: number; size?: number }>({
      query: ({ q = '', page = 0, size = 10 }) => ({
        url: '/groups/search',
        params: { q, page, size },
      }),
      providesTags: ['Group'],
    }),

    // Discover public groups
    discoverGroups: builder.query<{ success: boolean; data: any }, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => ({
        url: '/groups/discover',
        params: { page, size },
      }),
      providesTags: ['Group'],
    }),

    // Get popular groups
    getPopularGroups: builder.query<{ success: boolean; data: any }, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => ({
        url: '/groups/popular',
        params: { page, size },
      }),
      providesTags: ['Group'],
    }),

    // Check if user can join group
    canJoinGroup: builder.query<{ success: boolean; data: any }, number>({
      query: (groupId) => `/groups/${groupId}/can-join`,
    }),

    // Join a group
    joinGroup: builder.mutation<{ success: boolean; message: string; data: GroupMemberResponse }, GroupJoinRequest>({
      query: (body) => ({
        url: '/groups/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: 'Group', id: groupId },
        'Group',
      ],
    }),

    // Leave a group
    leaveGroup: builder.mutation<{ success: boolean; message: string }, number>({
      query: (groupId) => ({
        url: `/groups/${groupId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, groupId) => [
        { type: 'Group', id: groupId },
        'Group',
      ],
    }),

    // Get group recommendations
    getGroupRecommendations: builder.query<{ success: boolean; data: GroupResponse[] }, number>({
      query: (limit = 10) => ({
        url: '/groups/recommendations',
        params: { limit },
      }),
      providesTags: ['Group'],
    }),

    // Get group members
    getGroupMembers: builder.query<{ success: boolean; data: any }, { groupId: number; page?: number; size?: number }>({
      query: ({ groupId, page = 0, size = 10 }) => ({
        url: `/groups/${groupId}/members`,
        params: { page, size },
      }),
      // providesTags: (result, error, { groupId }) => [{ type: 'GroupMember', id: groupId }],
    }),

    // Search group members
    searchGroupMembers: builder.query<{ success: boolean; data: any }, { groupId: number; q?: string; page?: number; size?: number }>({
      query: ({ groupId, q = '', page = 0, size = 10 }) => ({
        url: `/groups/${groupId}/members/search`,
        params: { q, page, size },
      }),
      // providesTags: (result, error, { groupId }) => [{ type: 'GroupMember', id: groupId }],
    }),

    // Remove member from group
    removeMember: builder.mutation<{ success: boolean; message: string }, { groupId: number; memberId: string }>({
      query: ({ groupId, memberId }) => ({
        url: `/groups/${groupId}/members/${memberId}`,
        method: 'DELETE',
      }),
      // invalidatesTags: (result, error, { groupId }) => [{ type: 'GroupMember', id: groupId }],
    }),

    // Promote member to admin
    promoteToAdmin: builder.mutation<{ success: boolean; message: string }, { groupId: number; memberId: string }>({
      query: ({ groupId, memberId }) => ({
        url: `/groups/${groupId}/members/${memberId}/promote`,
        method: 'POST',
      }),
      // invalidatesTags: (result, error, { groupId }) => [{ type: 'GroupMember', id: groupId }],
    }),

    // Demote admin to member
    demoteFromAdmin: builder.mutation<{ success: boolean; message: string }, { groupId: number; memberId: string }>({
      query: ({ groupId, memberId }) => ({
        url: `/groups/${groupId}/members/${memberId}/demote`,
        method: 'POST',
      }),
      // invalidatesTags: (result, error, { groupId }) => [{ type: 'GroupMember', id: groupId }],
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
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useGetGroupByIdQuery,
  useGetUserGroupsQuery,
  useGetCreatedGroupsQuery,
  useSearchGroupsQuery,
  useDiscoverGroupsQuery,
  useGetPopularGroupsQuery,
  useCanJoinGroupQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useGetGroupRecommendationsQuery,
  useGetGroupMembersQuery,
  useSearchGroupMembersQuery,
  useRemoveMemberMutation,
  usePromoteToAdminMutation,
  useDemoteFromAdminMutation,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
} = groupsApi;