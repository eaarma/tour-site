// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // default: localStorage for web
import { persistReducer, persistStore } from "redux-persist";

import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import checkoutReducer from "./checkoutSlice";
import loadingReducer from "./loadingSlice";
import sessionReducer from "./sessionSlice";

import { authTransform } from "./persistTransforms";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth"],
  transforms: [authTransform],
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  loading: loadingReducer,
  session: sessionReducer,
});

const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, //Required for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
