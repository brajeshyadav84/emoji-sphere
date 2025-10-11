import { apiSlice } from './apiSlice';

// Types for the API
export interface CreatePostRequest {
  title?: string;
  content: string;
  emojiContent?: string;
  imageUrl?: string;
  isPublic?: boolean;
  categoryId?: number;
  tags?: string[];
}

export interface PostResponse {
  id: number;
  title?: string;
  content: string;
  emojiContent?: string;
  imageUrl?: string;
  isPublic: boolean;
  likesCount: number;
  commentsCount: number;
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
  category?: {
    id: number;
    name: string;
    description?: string;
  };
  tags?: {
    id: number;
    name: string;
  }[];
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  recentComments?: any[];
  hasMoreComments?: boolean;
}

export interface PostsResponse {
  content: PostResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface LikePostRequest {
  postId: number;
}

export interface CommentRequest {
  postId: number;
  content: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    mobile: string;
    gender?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// New types for detailed posts from stored procedure
export interface ReplyWithDetailsResponse {
  replyId: number;
  replyText: string;
  repliedBy: string;
  replyCreatedAt: string;
}

export interface CommentWithDetailsResponse {
  commentId: number;
  commentText: string;
  commentedBy: string;
  commentCreatedAt: string;
  likeCount: number;
  replies: ReplyWithDetailsResponse[];
}

export interface PostWithDetailsResponse {
  postId: number;
  userId: number;
  userName: string;
  gender: string;
  country: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  comments: CommentWithDetailsResponse[];
}

export interface PostsWithDetailsResponse {
  content: PostWithDetailsResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Extended API slice with posts endpoints
export const postsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all posts (feed)
    getPosts: builder.query<PostsResponse, {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
      useStoredProcedure?: boolean;
    }>({
      query: ({ page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc', useStoredProcedure = false } = {}) => ({
        url: '/posts',
        method: 'GET',
        params: { page, size, sortBy, sortDir, useStoredProcedure },
      }),
      providesTags: ['Post'],
    }),

    // Get posts with complete details using stored procedure
    getPostsWithDetails: builder.query<PostsWithDetailsResponse, {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    }>({
      query: ({ page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = {}) => ({
        url: '/posts/with-details',
        method: 'GET',
        params: { page, size, sortBy, sortDir },
      }),
      providesTags: ['Post'],
    }),

    // Get post by ID
    getPostById: builder.query<PostResponse, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Get post with comments
    getPostWithComments: builder.query<PostResponse, number>({
      query: (id) => `/posts/${id}/with-comments`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Create a new post
    createPost: builder.mutation<PostResponse, CreatePostRequest>({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      invalidatesTags: ['Post'],
    }),

    // Update a post
    updatePost: builder.mutation<PostResponse, { id: number; data: Partial<CreatePostRequest> }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),

    // Delete a post
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    // Like/Unlike a post
    toggleLikePost: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, postId) => [{ type: 'Post', id: postId }],
    }),

    // Add comment to post
    addComment: builder.mutation<CommentResponse, CommentRequest>({
      query: ({ postId, content }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: 'Post', id: postId }],
    }),

    // Get user's posts by mobile
    getUserPosts: builder.query<PostsResponse, {
      mobile: string;
      page?: number;
      size?: number;
    }>({
      query: ({ mobile, page = 0, size = 10 }) => ({
        url: `/posts/user/${mobile}`,
        params: { page, size },
      }),
      providesTags: ['Post'],
    }),

    // Get user's posts by ID
    getUserPostsById: builder.query<PostsResponse, {
      userId: string;
      page?: number;
      size?: number;
    }>({
      query: ({ userId, page = 0, size = 10 }) => ({
        url: `/posts/user-id/${userId}`,
        params: { page, size },
      }),
      providesTags: ['Post'],
    }),

    // Search posts
    searchPosts: builder.query<PostsResponse, {
      keyword: string;
      page?: number;
      size?: number;
    }>({
      query: ({ keyword, page = 0, size = 10 }) => ({
        url: '/posts/search',
        params: { keyword, page, size },
      }),
      providesTags: ['Post'],
    }),

    // Get trending posts
    getTrendingPosts: builder.query<PostsResponse, {
      page?: number;
      size?: number;
    }>({
      query: ({ page = 0, size = 10 } = {}) => ({
        url: '/posts/trending',
        params: { page, size },
      }),
      providesTags: ['Post'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPostsQuery,
  useGetPostsWithDetailsQuery,
  useGetPostByIdQuery,
  useGetPostWithCommentsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikePostMutation,
  useAddCommentMutation,
  useGetUserPostsQuery,
  useGetUserPostsByIdQuery,
  useSearchPostsQuery,
  useGetTrendingPostsQuery,
} = postsApi;