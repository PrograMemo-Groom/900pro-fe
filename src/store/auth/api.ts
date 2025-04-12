import API from "@/store/api/ApiConfig";
import { Auth } from '@/store/auth/endpoints';
import { AxiosResponse } from 'axios';
import type { SampleResponse } from '@/store/auth/thunks';

export const sample = async (): Promise<AxiosResponse<SampleResponse>> => {
  return await API.get("/data").then((data) => data);
}

export const loginUser = async (email: string, password: string) => {
  return await API.post(Auth.LOGIN, {email, password}).then((data) => data);
}
