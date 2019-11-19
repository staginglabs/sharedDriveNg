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
  SET_TOKEN: 'AUTH_ACTIONS_SET_TOKEN'
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
      if (res.status === 500) {
        if (res.error.code === 'incorrect_password') {
          this.toast.error('Incorrect Password', 'Error');
        } else if (res.error.code === 'invalid_username') {
          this.toast.error('Incorrect Username', 'Error');
        } else {
          this.toast.error('Something went wrong!', 'Error');
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

  public signOut(): CustomActions {
    // intimate api server for logout
    this.authService.signOut();
    return {
      type: AUTH_ACTIONS.SIGN_OUT
    };
  }
}
