import { Injectable } from '@angular/core';
import { ISignInRequest, ISignInResponse, ITokenReq, BaseResponse } from '../models';
import { HttpWrapperService } from './http-wrapper.service';
import { baseUrl, USER_URIS } from '../uris';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private http: HttpWrapperService,
    private router: Router,
  ) { }

  public signIn(payload: ISignInRequest): Promise<BaseResponse<ISignInResponse, ISignInRequest>> {
    return this.http.post(USER_URIS.login, payload);
  }

  public signOut() {
    this.http.post(USER_URIS.logout, {});
    this.router.navigate(['/login']);
  }

  public verifyToken(payload: ITokenReq): Promise<BaseResponse<any, ITokenReq>> {
    const uri = `${URL}/verifyToken`;
    return this.http.post(uri, payload);
  }
}
