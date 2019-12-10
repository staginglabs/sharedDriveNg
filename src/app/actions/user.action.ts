import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CustomActions } from '.';
import { UserService } from '../services';
import { BaseResponse, IUserDetailsData, ISuccessRes, IS3FilesReq, IFileFormRes } from '../models';
import { ToastrService } from 'ngx-toastr';

export const USER_ACTIONS = {
  EMPTY_ACTION: 'USER_ACTIONS_EMPTY_ACTION',
  GET_USERS_REQ: 'USER_ACTIONS_GET_USERS_REQ',
  GET_USERS_RES: 'USER_ACTIONS_GET_USERS_RES',
  LIST_USERS_WARNING: 'USER_ACTIONS_LIST_USERS_WARNING',
  GET_ORDERS_REQ: 'USER_ACTIONS_GET_ORDERS_REQ',
  GET_ORDERS_RES: 'USER_ACTIONS_GET_ORDERS_RES',
  GET_PROFILE_REQ: 'USER_ACTIONS_GET_PROFILE_REQ',
  GET_PROFILE_RES: 'USER_ACTIONS_GET_PROFILE_RES',
  UPDATE_PROFILE_REQ: 'USER_ACTIONS_UPDATE_PROFILE_REQ',
  UPDATE_PROFILE_RES: 'USER_ACTIONS_UPDATE_PROFILE_RES',
  CHANGE_PASSWORD_REQ: 'USER_ACTIONS_CHANGE_PASSWORD_REQ',
  CHANGE_PASSWORD_RES: 'USER_ACTIONS_CHANGE_PASSWORD_RES',
  GET_FOLDERS_REQ: 'USER_ACTIONS_GET_FOLDERS_REQ',
  GET_FOLDERS_RES: 'USER_ACTIONS_GET_FOLDERS_RES',
  GET_FILES_REQ: 'USER_ACTIONS_GET_FILES_REQ',
  GET_FILES_RES: 'USER_ACTIONS_GET_FILES_RES',
  TRIGGER_GET_FILES_REQ: 'USER_ACTIONS_TRIGGER_GET_FILES_REQ',
  TRIGGER_GET_FOLDER_REQ: 'USER_ACTIONS_TRIGGER_GET_FOLDER_REQ',
};

const EMPTY_ACTION = { type: USER_ACTIONS.EMPTY_ACTION };

@Injectable()
export class UserActions {

  @Effect()
  public getUsersReq$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_USERS_REQ),
    switchMap((action: CustomActions) => {
      return from(this.userService.getAllUsers()).pipe(
        map(response => {
          return this.getUsersRes(response);
        }),
        catchError((err: any) => {
          return of(this.getUsersErrorRes(err));
        })
      );
    })
  );

  @Effect()
  public getUsersRes$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_USERS_REQ),
    map((action: CustomActions) => EMPTY_ACTION)
  );

  @Effect()
  public getFoldersReq$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_FOLDERS_REQ),
    switchMap((action: CustomActions) => this.userService.getS3Folders(action.payload)),
    map(res => this.getFoldersRes(res))
  );

  @Effect()
  public getFoldersRes$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_FOLDERS_RES),
    map((action: CustomActions) => EMPTY_ACTION)
  );

  @Effect()
  public getFilesReq$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_FILES_REQ),
    switchMap((action: CustomActions) => this.userService.getS3Files(action.payload)),
    map(res => this.getFilesRes(res))
  );

  @Effect()
  public getFilesRes$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_FILES_RES),
    map((action: CustomActions) => EMPTY_ACTION)
  );

  @Effect()
  public getUserOrdersReq$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_ORDERS_REQ),
    switchMap((action: CustomActions) => this.userService.getUserOrders()),
    map(res => this.getUserOrdersRes(res))
  );

  @Effect()
  public getUserOrdersRes$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_ORDERS_RES),
    map((action: CustomActions) => EMPTY_ACTION)
  );

  @Effect()
  public getProfileReq$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_PROFILE_REQ),
    switchMap((action: CustomActions) => this.userService.getUserInfo()),
    map(res => this.getProfileRes(res))
  );

  @Effect()
  public getProfileRes$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.GET_PROFILE_RES),
    map((action: CustomActions) => EMPTY_ACTION)
  );

  @Effect()
  public updateProfileReq$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.UPDATE_PROFILE_REQ),
    switchMap((action: CustomActions) => this.userService.updateUserDetails(action.payload)),
    map(res => this.updateProfileRes(res))
  );

  @Effect()
  public updateProfileRes$: Observable<Action> = this.action$.pipe(
    ofType(USER_ACTIONS.UPDATE_PROFILE_RES),
    map((action: CustomActions) => {
      const res: BaseResponse<ISuccessRes, any> = action.payload;
      if (res.status === 200) {
        this.toast.success(res.body.message, 'Success');
      }
      // getting profile again to updated data
      return this.getProfileReq();
    })
  );

  constructor(
    private action$: Actions,
    private toast: ToastrService,
    private userService: UserService
  ) { }

  public getUsersReq(): CustomActions {
    return {
      type: USER_ACTIONS.GET_USERS_REQ
    };
  }

  public getUsersRes(payload: BaseResponse<any, any>): CustomActions {
    return {
      type: USER_ACTIONS.GET_USERS_RES,
      payload
    };
  }

  public getUsersErrorRes(payload: BaseResponse<any, any>): CustomActions {
    return {
      type: USER_ACTIONS.LIST_USERS_WARNING,
      payload
    };
  }

  public getUserOrdersReq(payload: string): CustomActions {
    return {
      type: USER_ACTIONS.GET_ORDERS_REQ,
      payload
    };
  }

  public getUserOrdersRes(payload: any): CustomActions {
    return {
      type: USER_ACTIONS.GET_ORDERS_RES,
      payload
    };
  }

  public getProfileReq(): CustomActions {
    return {
      type: USER_ACTIONS.GET_PROFILE_REQ
    };
  }

  public getProfileRes(payload: BaseResponse<IUserDetailsData, any>): CustomActions {
    return {
      type: USER_ACTIONS.GET_PROFILE_RES,
      payload
    };
  }

  public updateProfileReq(payload: any): CustomActions {
    return {
      type: USER_ACTIONS.UPDATE_PROFILE_REQ,
      payload
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

  public getFoldersReq(payload: string): CustomActions {
    return {
      type: USER_ACTIONS.GET_FOLDERS_REQ,
      payload
    };
  }

  public getFoldersRes(payload: BaseResponse<any[], any>): CustomActions {
    return {
      type: USER_ACTIONS.GET_FOLDERS_RES,
      payload
    };
  }

  public getFilesReq(payload: IS3FilesReq): CustomActions {
    return {
      type: USER_ACTIONS.GET_FILES_REQ,
      payload
    };
  }

  public getFilesRes(payload: BaseResponse<IFileFormRes[], any>): CustomActions {
    return {
      type: USER_ACTIONS.GET_FILES_RES,
      payload
    };
  }

  public triggerFileReq(payload: boolean): CustomActions {
    return {
      type: USER_ACTIONS.TRIGGER_GET_FILES_REQ,
      payload
    };
  }

  public triggerFolderReq(payload: boolean): CustomActions {
    return {
      type: USER_ACTIONS.TRIGGER_GET_FOLDER_REQ,
      payload
    };
  }

}
