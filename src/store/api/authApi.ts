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
    sendOtp: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/send-email-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<{ message: string }, { email: string; otp: string }>({
      query: (body) => ({
        url: '/auth/verify-email-otp',
        method: 'POST',
        body,
      }),
    }),
    signup: builder.mutation<{ message: string }, {
      fullName: string;
      mobile: string;
      email: string;
      password: string;
      confirmPassword: string;
      dob: string;
      country: string;
      gender: string;
      schoolName?: string;
      role?: string[];
    }>({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, {
      email: string;
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