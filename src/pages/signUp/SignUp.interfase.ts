export interface SignUpReq {
  username: string,
  email: string,
  password: string,
}
export interface SignUpRes {
  "success": boolean,
  "data": {
    "id": number,
    "email": string,
    "username": string,
    "password": string,
    "active": boolean
  },
  "message": string
}
