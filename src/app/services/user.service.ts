import { Injectable } from '@angular/core';
import { ISignInRequest, ISignInResponse, ITokenReq, BaseResponse, IChangePasswordReq, ISuccessRes, IUserDetailsData } from '../models';
import { HttpWrapperService } from './http-wrapper.service';
import { USER_URIS } from '../uris';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(
    private http: HttpWrapperService
  ) { }

  public changePassword(payload: IChangePasswordReq): Promise<BaseResponse<ISuccessRes, IChangePasswordReq>> {
    const url = USER_URIS.changePassword;
    return this.http.post(url, payload);
  }

  public getUserInfo(): Promise<BaseResponse<IUserDetailsData, any>> {
    const url = USER_URIS.getUserInfo;
    return this.http.post(url, {});
  }

  public getUserOrders(): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.getUserOrders;
    return this.http.post(url, {});
  }

  public updateUserDetails(payload: any): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.updateUserDetails;
    return this.http.post(url, payload);
  }
}
