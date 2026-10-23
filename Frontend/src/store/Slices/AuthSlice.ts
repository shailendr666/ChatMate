import { createSlice } from "@reduxjs/toolkit";

interface AuthUser {
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const SESSION_KEY = "chatmate_auth_user";

function loadFromSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const persistedUser = loadFromSession();

const initialState: AuthState = {
  user: persistedUser,
  isAuthenticated: !!persistedUser,
  isLoading: !persistedUser,
};

export const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      if (action.payload) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(action.payload));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      sessionStorage.removeItem(SESSION_KEY);
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setAuthLoading } = AuthSlice.actions;
export default AuthSlice.reducer;
