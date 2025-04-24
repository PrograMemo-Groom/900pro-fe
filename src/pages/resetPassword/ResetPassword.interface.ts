export interface ResetForm {
  email: string,
  password: string,
}

export interface verifyForm {
  email: string,
  success?: boolean
}

export interface VerifyResponse {
  success: boolean,
  message: string
}

export interface ResetPasswordResponse {
  success: boolean,
  message: string
}
