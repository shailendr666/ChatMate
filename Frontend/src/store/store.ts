import { configureStore } from "@reduxjs/toolkit";
import ChatReducer from "./Slices/ChatSlice";
import AuthReducer from "./Slices/AuthSlice";

export const store = configureStore({
  reducer: {
    chat: ChatReducer,
    auth: AuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
