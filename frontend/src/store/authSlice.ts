import { UserResponseDto } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: UserResponseDto | null;
  accessToken: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Used after login
    setAuth: (
      state,
      action: PayloadAction<{
        user: UserResponseDto | null;
        accessToken: string | null;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },

    // Optional: update token only (used by refresh)
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    // Used on logout / session expiration
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
    },

    setInitialized: (state) => {
      state.initialized = true;
    },
  },
});

export const { setAuth, setAccessToken, clearUser, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
