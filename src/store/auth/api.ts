import { apiRequest, ApiResponse } from "@/api/restClient";
import { Auth } from '@/store/auth/endpoints';
import { AxiosResponse } from 'axios';
import type { SampleResponse } from '@/store/auth/thunks';

export interface LoginResponse {
  userId: number;
  teamId: number | null;
  token: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  teamId: number | null;
  isTeamLeader: boolean;
  active: boolean;
}

export const sample = async (): Promise<AxiosResponse<ApiResponse<SampleResponse>>> => {
  return await apiRequest.get<SampleResponse>("/data");
}

export const loginUser = async (email: string, password: string): Promise<AxiosResponse<ApiResponse<LoginResponse>>> => {
  return await apiRequest.post<LoginResponse>(Auth.LOGIN, {email, password});
}

export const getUserInfo = async (userId: number): Promise<AxiosResponse<ApiResponse<UserResponse>>> => {
  return await apiRequest.get<UserResponse>(`${Auth.GET_USER_INFO}${userId}`);
}
