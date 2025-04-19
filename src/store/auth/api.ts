import { apiRequest, ApiResponse } from "@/api/restClient";
import { Auth } from '@/store/auth/endpoints';
import { AxiosResponse } from 'axios';
import type { SampleResponse } from '@/store/auth/thunks';

export interface LoginResponse {
  email: string;
  token: string;
  // 아직 백엔드에서 로그인, 회원정보 관련 응답이 개발중에 있음
}

export const sample = async (): Promise<AxiosResponse<ApiResponse<SampleResponse>>> => {
  return await apiRequest.get<SampleResponse>("/data");
}

export const loginUser = async (email: string, password: string): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
  return await apiRequest.post<LoginResponse>(Auth.LOGIN, {email, password});
}
