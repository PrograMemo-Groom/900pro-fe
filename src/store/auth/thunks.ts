import { createAsyncThunk } from '@reduxjs/toolkit';
import { sample } from '@/store/auth/api.ts';

/** 응답 데이터 타입 예시 (실제 구조에 맞게 수정) */
export interface SampleResponse {
  message: string;
  data?: any;
}

/** 에러 타입 예시 */
interface APIError {
  message: string;
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

// ApiResponse 형식
// {
//   "success": true,
//   "data": {
//     "message": "샘플 데이터 조회 성공",
//     "data": { "key": "value" }
//   },
//   "message": null
// }
