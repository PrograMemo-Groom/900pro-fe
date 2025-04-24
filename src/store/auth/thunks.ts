import { createAsyncThunk } from '@reduxjs/toolkit';
import { sample, loginUser, LoginResponse, getUserInfo, UserResponse } from '@/store/auth/api.ts';
import { login, updateUserInfo, updateToken, updatePartialUserInfo } from '@/store/auth/slices';
import { RootState } from '@/store';

/** 응답 데이터 타입 예시 (실제 구조에 맞게 수정) */
export interface SampleResponse {
  message: string;
  data?: any;
}

/** 에러 타입 예시 */
interface APIError {
  message: string;
}

// 백엔드 응답의 snake_case 타입
interface LoginResponseRaw {
  user_id: number;
  team_id: number | null;
  token: string;
}

export interface AuthResult {
  userData: UserResponse | null;
  loginData: LoginResponse;
  teamId: number | null;
}

// createAsyncThunk<ReturnType, ParamType, ThunkAPIConfig>()
export const sampleTest = createAsyncThunk<SampleResponse, void, { rejectValue: APIError }>
  ('sample/test', async (_, { rejectWithValue }) => {
    try {
      const response = await sample();
      console.log("authThunk : ", response.data);
      return response.data.data;

    } catch (e: any) {
      console.error('error', e);
      return rejectWithValue({ message: e.message ?? 'Unknown error' });
    }
  }
);

// 로그인 thunk
export const loginUserThunk = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: APIError }
>('auth/login', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const response = await loginUser(credentials.email, credentials.password);
    const loginData = response.data.data as unknown as LoginResponseRaw;

    // snake_case를 camelCase로 변환
    const transformedData = {
      userId: loginData.user_id,
      teamId: loginData.team_id,
      token: loginData.token
    };

    // 로그인 정보 저장
    dispatch(login({
      token: transformedData.token,
      userId: transformedData.userId,
      teamId: transformedData.teamId
    }));

    // 로그인 성공 후 사용자 정보 요청
    try {
      const userResponse = await getUserInfo(transformedData.userId);
      dispatch(updateUserInfo(userResponse.data.data));
      // 이제 user.id와 userId가 동기화됨
    } catch (userError) {
      console.error('사용자 정보 가져오기 실패:', userError);
      // 사용자 정보 요청 실패해도 로그인은 유지
    }

    return transformedData;
  } catch (e: any) {
    console.error('로그인 오류:', e);
    return rejectWithValue({ message: e.message ?? '로그인 중 오류가 발생했습니다.' });
  }
});

// 완전한 인증 프로세스를 처리하는 통합 thunk (로그인 + 사용자 정보)
export const completeAuthProcess = createAsyncThunk<
  AuthResult,
  { email: string; password: string },
  { rejectValue: APIError }
>('auth/completeAuth', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    // 1. 로그인 요청
    const response = await loginUser(credentials.email, credentials.password);
    const loginData = response.data.data as unknown as LoginResponseRaw;

    // snake_case를 camelCase로 변환
    const transformedLoginData = {
      userId: loginData.user_id,
      teamId: loginData.team_id,
      token: loginData.token
    };

    // 2. 로그인 정보 저장
    dispatch(login({
      token: transformedLoginData.token,
      userId: transformedLoginData.userId,
      teamId: transformedLoginData.teamId
    }));

    // 3. 사용자 정보 요청
    let userData = null;
    try {
      const userResponse = await getUserInfo(transformedLoginData.userId);
      userData = userResponse.data.data;
      dispatch(updateUserInfo(userData));

      // 4. 팀ID 결정 (사용자 정보의 팀ID 우선)
      const finalTeamId = userData.teamId !== undefined ? userData.teamId : transformedLoginData.teamId;

      return {
        userData,
        loginData: transformedLoginData,
        teamId: finalTeamId
      };
    } catch (userError) {
      console.error('사용자 정보 가져오기 실패:', userError);
      // 사용자 정보 요청 실패해도 로그인은 유지하고 로그인 응답의 teamId 사용
      return {
        userData: null,
        loginData: transformedLoginData,
        teamId: transformedLoginData.teamId
      };
    }
  } catch (e: any) {
    console.error('인증 프로세스 오류:', e);
    return rejectWithValue({ message: e.message ?? '로그인 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 가져오기 thunk
export const getUserInfoThunk = createAsyncThunk<
  UserResponse,
  number | undefined,
  { rejectValue: APIError; state: RootState }
>('auth/getUserInfo', async (userId, { dispatch, getState, rejectWithValue }) => {
  try {
    const actualUserId = userId ?? getState().auth.userId;

    if (!actualUserId) {
      return rejectWithValue({ message: '사용자 ID가 없습니다. 먼저 로그인하세요.' });
    }

    const response = await getUserInfo(actualUserId);
    const userData = response.data.data;
    dispatch(updateUserInfo(userData));

    return userData;
  } catch (e: any) {
    console.error('사용자 정보 가져오기 오류:', e);
    return rejectWithValue({ message: e.message ?? '사용자 정보를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 일부만 업데이트하는 thunk
export const updatePartialUserInfoThunk = createAsyncThunk<
  Partial<UserResponse>,
  Partial<UserResponse>,
  { rejectValue: APIError }
>('auth/updatePartialUserInfo', async (userData, { dispatch, rejectWithValue }) => {
  try {
    dispatch(updatePartialUserInfo(userData));
    return userData;
  } catch (e: any) {
    return rejectWithValue({ message: e.message ?? '사용자 정보 업데이트 중 오류가 발생했습니다.' });
  }
});

// 토큰 업데이트 thunk
export const updateTokenThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: APIError }
>('auth/updateToken', async (token, { dispatch, rejectWithValue }) => {
  try {
    dispatch(updateToken(token));
    return token;
  } catch (e: any) {
    return rejectWithValue({ message: e.message ?? '토큰 업데이트 중 오류가 발생했습니다.' });
  }
});

// ApiResponse 형식
// {
//   "success": true,
//   "data": {
//     "message": "샘플 데이터 조회 성공",
//     "data": { "key": "value" }
//   },
//   "message": null
// }
