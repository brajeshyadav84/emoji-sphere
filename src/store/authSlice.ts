import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApiResponse, LoginResponse } from './api/authApi';

export interface User {
  id: string;
  fullName: string;
  name: string;
  mobile: string;
  email: string;
  role: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loginSuccess: (
      state,
      action: PayloadAction<
        ApiResponse<LoginResponse> | LoginResponse | { user: User; token: string } | any
      >,
    ) => {
      const payload = (action.payload || {}) as any;
      // API may return a wrapper { success, message, data }
      // or directly the LoginResponse, or legacy { user, token }
      const data = payload.data ?? payload;

      let token: string | null = null;
      let user: User | null = null;

      // Legacy shape: { user, token }
      if (payload.user && payload.token) {
        user = payload.user as User;
        token = payload.token;
      } else if (data) {
        // New shape: data contains token and user fields
        token = data.token ?? null;

        // If API returns a nested user object, use it; otherwise map fields from data
        if (data.user) {
          user = data.user as User;
        } else {
          user = {
            id: data.id !== undefined && data.id !== null ? String(data.id) : '',
            fullName: data.fullName || data.full_name || data.name || '',
            name: data.name || data.fullName || '',
            mobile: data.mobile || '',
            email: data.email || '',
            role: data.role || '',
            roles: Array.isArray(data.roles) ? data.roles : data.roles ? [data.roles] : [],
          };
        }
      }

      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
      state.isLoading = false;

      if (token) {
        localStorage.setItem('auth_token', token);
      }
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
    },
  },
});

export const { setLoading, loginSuccess, logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;