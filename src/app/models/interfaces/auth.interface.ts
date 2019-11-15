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

interface IUserUploadObj {
  LastModified: string;
  Notes: string;
  email: string;
  // drive will represent user email
  // drive>myfiles
  //
  isUploadedByUser: boolean;
  // if false
  // folder name
  /**
   * URL of the uploaded object.
   */
  Location: string;
  /**
   * ETag of the uploaded object.
   */
  ETag: string;
  /**
   * Bucket to which the object was uploaded.
   */
  Bucket: string;
  /**
   * Key to which the object was uploaded.
   */
  Key: string;
}
