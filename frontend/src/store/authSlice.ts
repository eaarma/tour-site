import { UserResponseDto } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: UserResponseDto | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
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
      }>
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
  },
});

export const { setAuth, setAccessToken, clearUser } = authSlice.actions;
export default authSlice.reducer;
