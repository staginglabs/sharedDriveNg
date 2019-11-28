import { CustomActions, USER_ACTIONS } from '../actions';
import { cloneDeep } from '../lodash.optimized';
import {
  BaseResponse, IIOrderRootRes,
  IOrderRes, IUserDetailsData, IUserDetailsRoot, ISuccessRes, IFileFormRes
} from '../models';
import { MY_FILES } from '../app.constant';

export interface UserState {
  gettingFoldersInProgress: boolean;
  folders: string[];
  orders: IOrderRes[];
  details: IUserDetailsData;
  updateProfileProgress: boolean;
  gettingfileInProgress: boolean;
  files: IFileFormRes[];
  triggerFileReq: boolean;
}

const initialState: UserState = {
  folders: [],
  gettingFoldersInProgress: false,
  orders: null,
  details: null,
  gettingfileInProgress: false,
  updateProfileProgress: false,
  files: [],
  triggerFileReq: false
};

export function userReducer(state = initialState, action: CustomActions): UserState {
  switch (action.type) {
    case USER_ACTIONS.EMPTY_ACTION: {
      return state;
    }
    case USER_ACTIONS.GET_ORDERS_RES: {
      const res: BaseResponse<IIOrderRootRes, any> = action.payload;
      if (res && res.body && res.body.data) {
        return { ...state, orders: res.body.data };
      }
      return { ...state, orders: [] };
    }
    case USER_ACTIONS.GET_PROFILE_REQ: {
      return state;
    }
    case USER_ACTIONS.GET_PROFILE_RES: {
      const res: BaseResponse<IUserDetailsData, any> = action.payload;
      if (res && res.body) {
        return { ...state, details: res.body };
      }
      return state;
    }
    case USER_ACTIONS.UPDATE_PROFILE_REQ: {
      return { ...state, updateProfileProgress: true };
    }
    case USER_ACTIONS.UPDATE_PROFILE_RES: {
      return {...state, updateProfileProgress: false };
    }
    case USER_ACTIONS.GET_FOLDERS_REQ: {
      return { ...state, folders: [], gettingFoldersInProgress: true };
    }
    case USER_ACTIONS.GET_FOLDERS_RES: {
      const res: BaseResponse<string[], any> = action.payload;
      let arr = [];
      if (res && res.body && res.body.length) {
        res.body.forEach(name => {
          name = name.trim();
          if (name !== MY_FILES) {
            if (arr.indexOf(name) === -1 ) {
              arr.push(name);
            }
          }
        });
      }
      return { ...state, folders: arr, gettingFoldersInProgress: false };
    }
    case USER_ACTIONS.GET_FILES_REQ: {
      return { ...state, files: [], gettingfileInProgress: true };
    }
    case USER_ACTIONS.GET_FILES_RES: {
      const res: BaseResponse<IFileFormRes[], any> = action.payload;
      if (res && res.body) {
        return { ...state, files: res.body, gettingfileInProgress: false };
      }
      return {...state, gettingfileInProgress: false};
    }
    case USER_ACTIONS.TRIGGER_GET_FILES_REQ: {
      return { ...state, triggerFileReq: action.payload };
    }
    default: {
      return state;
    }
  }
}
