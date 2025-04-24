import { SampleResponse } from '@/store/auth/thunks.ts';

export interface LoginFormValues {
  email: string;
  password: string;
}
export interface LoginProps {
  initialValues?: LoginFormValues;
}
export interface LoginDataResponse {
  success: boolean;
  data: {
    user_id: number;
    team_id: number | null;
    token: string;
  };
  message: string;
}
export type LoginResult = LoginDataResponse | SampleResponse;
