import { createSlice } from "@reduxjs/toolkit";

interface SessionState {
  expired: boolean;
}

const initialState: SessionState = {
  expired: false,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    markExpired: (state) => {
      if (state.expired) return;
      state.expired = true;
    },

    clearExpired: (state) => {
      state.expired = false;
    },
  },
});

export const { markExpired, clearExpired } = sessionSlice.actions;
export default sessionSlice.reducer;
