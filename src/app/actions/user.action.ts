import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CustomActions } from '.';
// import { UserService } from '../services';

export const USER_ACTIONS = {
  EMPTY_ACTION: 'USER_ACTIONS_EMPTY_ACTION',
  GET_PROFILE_REQ: 'USER_ACTIONS_GET_PROFILE_REQ',
  GET_PROFILE_RES: 'USER_ACTIONS_GET_PROFILE_RES',
  UPDATE_PROFILE_REQ: 'USER_ACTIONS_UPDATE_PROFILE_REQ',
  UPDATE_PROFILE_RES: 'USER_ACTIONS_UPDATE_PROFILE_RES',
  CHANGE_PASSWORD_REQ: 'USER_ACTIONS_CHANGE_PASSWORD_REQ',
  CHANGE_PASSWORD_RES: 'USER_ACTIONS_CHANGE_PASSWORD_RES'
};

const EMPTY_ACTION = { type: USER_ACTIONS.EMPTY_ACTION };

@Injectable()
export class UserActions {

  // @Effect()
  // public getProfileReq$: Observable<Action> = this.action$.pipe(
  //   ofType(USER_ACTIONS.GET_PROFILE_REQ),
  //   switchMap((action: CustomActions) => this.userService.getProfile()),
  //   map(res => this.getProfileRes(res))
  // );

  // @Effect()
  // public getProfileRes$: Observable<Action> = this.action$.pipe(
  //   ofType(USER_ACTIONS.GET_PROFILE_RES),
  //   map((action: CustomActions) => EMPTY_ACTION)
  // );

  // @Effect()
  // public updateProfileReq$: Observable<Action> = this.action$.pipe(
  //   ofType(USER_ACTIONS.UPDATE_PROFILE_REQ),
  //   switchMap((action: CustomActions) => this.userService.updateProfile(action.payload.userId, action.payload.model)),
  //   map(res => this.updateProfileRes(res))
  // );

  // @Effect()
  // public updateProfileRes$: Observable<Action> = this.action$.pipe(
  //   ofType(USER_ACTIONS.UPDATE_PROFILE_RES),
  //   map((action: CustomActions) => {
  //     let res: any = action.payload;
  //     if (!res.successful) {
  //       console.log('[error] USER_ACTIONS.UPDATE_PROFILE_RES', res.errorData);
  //     }
  //     return EMPTY_ACTION;
  //   })
  // );

  constructor(
    private action$: Actions,
    // private userService: UserService
  ) { }

  public getProfileReq(): CustomActions {
    return {
      type: USER_ACTIONS.GET_PROFILE_REQ
    };
  }

  public getProfileRes(payload: any): CustomActions {
    return {
      type: USER_ACTIONS.GET_PROFILE_RES,
      payload
    };
  }

  public updateProfileReq(userId: number, model: any): CustomActions {
    return {
      type: USER_ACTIONS.UPDATE_PROFILE_REQ,
      payload: { userId, model }
    };
  }

  public updateProfileRes(payload: any): CustomActions {
    return {
      type: USER_ACTIONS.UPDATE_PROFILE_RES,
      payload
    };
  }

  public changePasswordReq(userId: number, model: any): CustomActions {
    return {
      type: USER_ACTIONS.CHANGE_PASSWORD_REQ,
      payload: { userId, model }
    };
  }

  public changePasswordRes(payload: any): CustomActions {
    return {
      type: USER_ACTIONS.CHANGE_PASSWORD_RES,
      payload
    };
  }

}
