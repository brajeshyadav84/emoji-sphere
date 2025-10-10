import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'http://localhost:8081/api';

// Custom base query with error handling
const baseQueryWithErrorHandling: BaseQueryFn = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Add common headers
      headers.set('Content-Type', 'application/json');
      
      // Add auth token if available
      // const token = (getState() as RootState).auth?.token;
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`);
      // }
      
      return headers;
    },
  });

  const result = await baseQuery(args, api, extraOptions);

  // Handle common error cases
  if (result.error) {
    console.error('API Error:', result.error);
    
    // You can add global error handling here
    if (result.error.status === 401) {
      // Handle unauthorized
      console.log('Unauthorized - redirecting to login');
    }
  }

  return result;
};

// Main API slice that can be extended
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ['User', 'Post', 'Group', 'Zoom'],
  endpoints: () => ({}),
});

export default apiSlice;