import { createAsyncThunk } from '@reduxjs/toolkit';
import { sample } from '@/store/auth/api.ts';

/** 응답 데이터 타입 예시 (실제 구조에 맞게 수정) */
interface SampleResponse {
  message: string;
  data?: any;
}

/** 에러 타입 예시 */
interface APIError {
  message: string;
}

export const sampleTest = createAsyncThunk<SampleResponse, void, { rejectValue: APIError }>
  ('sample/test', async (_, { rejectWithValue }) => {
    try {
      const response = await sample();
      console.log(response.data);
      return response.data; // ✅ 응답 구조 맞게 수정

    } catch (e: any) {
      console.error('error', e);
      return rejectWithValue({ message: e.message ?? 'Unknown error' });
    }
  }
);
