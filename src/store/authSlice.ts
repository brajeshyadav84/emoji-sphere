import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('auth_token', action.payload.token);
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user));
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