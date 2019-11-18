import { Injectable } from '@angular/core';
import { ISignInRequest, ISignInResponse, ITokenReq, BaseResponse } from '../models';
import { HttpWrapperService } from './http-wrapper.service';
import { USER_URIS } from '../uris';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(
    private http: HttpWrapperService
  ) { }

  public getUserOrders(payload: string): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.getUserOrders;
    return this.http.post(url, {token: payload});
  }
}
