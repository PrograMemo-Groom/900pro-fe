import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** 1. 상태 타입 정의 */
export interface AuthState {
  isLoggedIn: boolean;
  user: object;
  token: string | null;
}

/** 2. 초기 상태 정의 */
const initialState: AuthState = {
  isLoggedIn: false,
  user: {},
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => initialState,
  },
  // extraReducers: (builder => {
    // builder
    //   .addCase();
  // },
});

export const {
  resetAuth,
} = authSlice.actions;
export default authSlice.reducer;
