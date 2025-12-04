import { createSlice } from "@reduxjs/toolkit";

interface LoadingState {
  activeRequests: number;
}

const initialState: LoadingState = {
  activeRequests: 0,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    startRequest: (state) => {
      state.activeRequests++;
    },
    endRequest: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
    },
  },
});

export const { startRequest, endRequest } = loadingSlice.actions;
export default loadingSlice.reducer;
