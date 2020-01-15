export interface ISignInRequest {
  username: string;
  password: string;
}

export interface IUserData {
  user_nicename: string;
  user_email: string;
  display_name: string;
  first_name: any;
  last_name: any;
  is_admin: boolean;
  billing_phone: number;
  company_name: string;
}

export interface ISignInResponse {
  status: string;
  data: IUserData;
  token: string;
}

export interface ITokenReq {
  token: string;
}

export interface IMsgRes {
  request_id?: string;
  message?: string;
  type: string;
}
