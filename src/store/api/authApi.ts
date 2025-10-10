import { apiSlice } from './apiSlice';

export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: string;
  roles: string[];
  name: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
    // Add other auth endpoints as needed
    sendOtp: builder.mutation<{ message: string }, { mobile: string }>({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<{ message: string }, { mobile: string; otp: string }>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    signup: builder.mutation<{ message: string }, {
      mobile: string;
      fullName: string;
      password: string;
      email: string;
      age: number;
      country: string;
      gender: string;
      schoolName?: string;
    }>({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { mobile: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, {
      mobile: string;
      otp: string;
      newPassword: string;
      confirmPassword: string;
    }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSignupMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;