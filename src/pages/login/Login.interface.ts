import { SampleResponse } from '@/store/auth/thunks.ts';

export interface LoginFormValues {
  email: string;
  password: string;
}
export interface LoginProps {
  initialValues?: LoginFormValues;
}
export interface LoginDataResponse {
  "status": number,
  "message": string,
  "path": string,
  "error": string
}
export type LoginResult = LoginDataResponse | SampleResponse;
