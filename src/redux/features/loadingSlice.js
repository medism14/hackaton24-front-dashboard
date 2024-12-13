import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  loadingPage: null,
  loadingStartTime: null
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    startPageLoading: (state, action) => {
      if (!state.isLoading) {
        state.isLoading = true;
        state.loadingPage = action.payload;
        state.loadingStartTime = Date.now();
      }
    },
    stopPageLoading: (state) => {
      state.isLoading = false;
      state.loadingPage = null;
      state.loadingStartTime = null;
    }
  }
});

export const { startPageLoading, stopPageLoading } = loadingSlice.actions;
export default loadingSlice.reducer; 