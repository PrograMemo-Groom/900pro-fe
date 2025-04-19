export interface LoginFormValues {
  email: string;
  password: string;
}
export interface SignUpFormValues {
  name: string;
  email: string;
  password: string;
}
export interface LoginProps {
  initialValues?: SignUpFormValues;
}
export interface SignUpProps {
  initialValues?: SignUpFormValues;
}
