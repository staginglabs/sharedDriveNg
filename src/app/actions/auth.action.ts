import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, from, of } from 'rxjs';
import { CustomActions } from '.';
import { ISignInRequest, ISignInResponse, BaseResponse } from '../models';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AuthService } from '../services';
import { ToastrService } from 'ngx-toastr';

export const AUTH_ACTIONS = {
  EMPTY_ACTION: 'AUTH_ACTIONS_EMPTY_ACTION',
  SIGNIN_REQUEST: 'AUTH_ACTIONS_SIGNIN_REQUEST',
  SIGNIN_RESPONSE: 'AUTH_ACTIONS_SIGNIN_RESPONSE',
  SIGN_OUT: 'AUTH_ACTIONS_SIGN_OUT',
  SET_TOKEN: 'AUTH_ACTIONS_SET_TOKEN',
  SET_OTP_STATUS: 'AUTH_ACTIONS_SET_OTP_STATUS',
  SET_OTP_SENT_STATUS: 'AUTH_ACTIONS_SET_OTP_SENT_STATUS',
  LOCAL_SIGNIN_RESPONSE: 'AUTH_ACTIONS_LOCAL_SIGNIN_RESPONSE',
  TOKEN_VERIFY_RESPONSE: 'AUTH_ACTIONS_TOKEN_VERIFY_RESPONSE'
};

const EMPTY_ACTION = { type: AUTH_ACTIONS.EMPTY_ACTION };

@Injectable()
export class AuthActions {

  @Effect()
  public signIn$: Observable<Action> = this.action$.pipe(
    ofType(AUTH_ACTIONS.SIGNIN_REQUEST),
    switchMap((action: CustomActions) => {
      return from(this.authService.signIn(action.payload)).pipe(
        map(response => {
          return this.signInRes(response);
        }),
        catchError((err: any) => {
          return of(this.signInRes(err));
        })
      );
    })
  );

  @Effect()
  public signInResponse$: Observable<Action> = this.action$.pipe(
    ofType(AUTH_ACTIONS.SIGNIN_RESPONSE),
    map((action: CustomActions) => {
      let res: BaseResponse<ISignInResponse, any> = action.payload;
      if (res.status === 422) {
        if (res.error.code === 'AUTHENTICATION_FAILURE') {
          this.toast.error('Nombre de usuario o contraseña incorrecta', 'Error');
        } else if (res.error.code === 'invalid_username') {
          this.toast.error('Nombre de usuario incorrecto', 'Error');
        } else {
          this.toast.error('Nombre de usuario o contraseña incorrecta', 'Error');
        }
      }
      return EMPTY_ACTION;
    })
  );

  constructor(
    private action$: Actions,
    private toast: ToastrService,
    private authService: AuthService
  ) { }

  public signInReq(payload: ISignInRequest): CustomActions {
    return {
      type: AUTH_ACTIONS.SIGNIN_REQUEST,
      payload
    };
  }

  public signInRes(payload: any): CustomActions {
    return {
      type: AUTH_ACTIONS.SIGNIN_RESPONSE,
      payload
    };
  }

  public setToken(payload: string): CustomActions {
    return {
      type: AUTH_ACTIONS.SET_TOKEN,
      payload
    };
  }

  public setOTPStatus(payload: boolean): CustomActions {
    return {
      type: AUTH_ACTIONS.SET_OTP_STATUS,
      payload
    };
  }

  public isOtpSent(payload: boolean): CustomActions {
    return {
      type: AUTH_ACTIONS.SET_OTP_SENT_STATUS,
      payload
    };
  }

  public updateUserAuthDetailsLocal(payload: any): CustomActions {
    return {
      type: AUTH_ACTIONS.LOCAL_SIGNIN_RESPONSE,
      payload
    };
  }

  public setTokenResponse(payload: any): CustomActions {
    return {
      type: AUTH_ACTIONS.TOKEN_VERIFY_RESPONSE,
      payload
    };
  }

  public signOut(): CustomActions {
    // intimate api server for logout
    this.authService.signOut();
    return {
      type: AUTH_ACTIONS.SIGN_OUT
    };
  }
}
