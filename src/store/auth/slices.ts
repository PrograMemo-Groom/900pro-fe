import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserResponse } from './api';

/** 1. 상태 타입 정의 */
export interface AuthState {
  isLoggedIn: boolean;
  user: {
    id?: number;
    email?: string;
    username?: string;
    teamId?: number | null;
    isTeamLeader?: boolean;
    active?: boolean;
  };
  userId: number | null;
  token: string | null;
}

/** 2. 초기 상태 정의 */
const initialState: AuthState = {
  isLoggedIn: false,
  user: {},
  userId: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => initialState,
    login: (state, action: PayloadAction<{ token: string; userId: number; teamId: number | null }>) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      if (!state.user.id) {
        state.user = {
          ...state.user,
          id: action.payload.userId,
          teamId: action.payload.teamId
        };
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userId = null;
      state.user = {};
    },
    updateUserInfo: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
      if (action.payload.id) {
        state.userId = action.payload.id;
      }
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    updatePartialUserInfo: (state, action: PayloadAction<Partial<UserResponse>>) => {
      state.user = {
        ...state.user,
        ...action.payload
      };
    }
  },
  // extraReducers: (builder => {
    // builder
    //   .addCase();
  // },
});

export const {
  resetAuth,
  login,
  logout,
  updateUserInfo,
  updateToken,
  updatePartialUserInfo
} = authSlice.actions;
export default authSlice.reducer;
