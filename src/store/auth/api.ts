import API from "@/store/api/ApiConfig";
import { Auth } from '@/store/auth/endpoints.ts';

export const sample = async () => {
  return await API.post("/data").then((data) => data);
}

export const loginUser = async (email: string, password: string) => {
  return await API.post(Auth.LOGIN, {email, password}).then((data) => data);
}
