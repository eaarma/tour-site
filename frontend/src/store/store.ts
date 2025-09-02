import { configureStore } from "@reduxjs/toolkit";

// Example slice — you will replace this with your actual slices
import counterReducer from "./counterSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
