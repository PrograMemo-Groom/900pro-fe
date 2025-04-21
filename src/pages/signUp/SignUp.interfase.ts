export interface SignUpReq {
  username: string,
  email: string,
  password: string,
}
export type SignUpRes = SignUpSuccess | SignUpFail;
export interface SignUpSuccess {
  "success": true,
  "data": {
    "id": number,
    "email": string,
    "username": string,
    "password": string,
    "active": boolean
  },
  "message": string
}
export interface SignUpFail {
  success: false,
  data: null,
  message: string,
}
