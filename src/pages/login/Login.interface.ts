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
  "error": string,
  timestamp: string
}
