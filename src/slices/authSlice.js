import { createSlice , createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "../api/axios";

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (refreshToken, thunkAPI) => {
    try {
      await api.post("/auth/logout/", {
        refresh: refreshToken,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Logout failed");
    }
  },
);

const initialState = {
  access: null,
  refresh: null,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null; // خطای قبلی پاک بشه
    },

    loginSuccess: (state, action) => {
      state.loading = false;
      state.error = null;

      state.access = action.payload.access;
      state.refresh = action.payload.refresh ?? null;
      state.user = action.payload.user ?? null;
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.access = null;
      state.refresh = null;
      state.user = null;
    },

    // 👇 Register
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.error = null;

      // اگر بک‌اند بعد ثبت‌نام توکن داد:
      state.access = action.payload.access ?? null;
      state.refresh = action.payload.refresh ?? null;

      // اگر بک‌اند user برگردوند:
      state.user = action.payload.user ?? null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.access = null;
      state.refresh = null;
      state.user = null;
      state.loading = false;
      state.error = null;
    },

    //  اختیاری ولی خیلی کاربردی: وقتی access رو با refresh تمدید کردی
    setTokens: (state, action) => {
      state.access = action.payload.access;
      state.refresh = action.payload.refresh;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.access = null;
        state.refresh = null;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logout,
  setUser,
  setTokens,
} = authSlice.actions;

export default authSlice.reducer;
