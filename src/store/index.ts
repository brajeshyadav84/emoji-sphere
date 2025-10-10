import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { zoomApi } from './api/zoomApi';
import apiSlice from './api/apiSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    // RTK Query API slices
    [zoomApi.reducerPath]: zoomApi.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // Regular slices
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types from RTK Query
          'persist/PERSIST',
          'persist/REHYDRATE',
        ],
      },
    }).concat(
      zoomApi.middleware,
      apiSlice.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for use in components
export { useAppDispatch, useAppSelector } from './hooks';