import { CustomActions, USER_ACTIONS } from '../actions';
import { cloneDeep } from '../lodash.optimized';
import {
  BaseResponse, IIOrderRootRes,
  IOrderRes, IUserDetailsData, IUserDetailsRoot, ISuccessRes, IFileFormRes, IUserList, ICreateFolderDetails
} from '../models';
import { compare, MY_FILES } from '../app.constant';

export interface UserState {
  activeUser: any;
  listUserErrorDetails: any;
  gettingUsersInProgress: boolean;
  allUsers: any[];
  onlineUsers: any[];
  offlineUsers: any[];
  gettingFoldersInProgress: boolean;
  folders: ICreateFolderDetails[];
  orders: IOrderRes[];
  details: IUserDetailsData;
  updateProfileProgress: boolean;
  gettingfileInProgress: boolean;
  files: IFileFormRes[];
  triggerFileReq: boolean;
  triggerFolderReq: boolean;
}

const initialState: UserState = {
  activeUser: null,
  listUserErrorDetails: null,
  gettingUsersInProgress: false,
  allUsers: [],
  onlineUsers: [],
  offlineUsers: [],
  folders: [],
  gettingFoldersInProgress: false,
  orders: null,
  details: null,
  gettingfileInProgress: false,
  updateProfileProgress: false,
  files: [],
  triggerFileReq: false,
  triggerFolderReq: false
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
    case USER_ACTIONS.GET_USERS_REQ: {
      return {...state, gettingUsersInProgress: true, listUserErrorDetails: null };
    }
    case USER_ACTIONS.LIST_USERS_WARNING: {
      const res: BaseResponse<any, any> = action.payload;
      return {
        ...state,
        listUserErrorDetails: res.error,
        gettingUsersInProgress: false,
        allUsers: [],
        onlineUsers: [],
        offlineUsers: [],
      };
    }
    case USER_ACTIONS.GET_USERS_RES: {
      const res: BaseResponse<IUserList[], any> = action.payload;
      let arr: IUserList[] = res.body.sort((a, b) => {
        let column = 'displayName';
        let ar;
        if (typeof a[column] === 'string' && typeof b[column] === 'string') {
          ar = compare(a[column].toLocaleLowerCase(), b[column].toLocaleLowerCase());
        } else {
          ar = compare(a[column], b[column]);
        }
        return ar;
      });
      let onlineUsers = arr.filter(item => !item.isOffline);
      let offlineUsers = arr.filter(item => item.isOffline);
      return {
        ...state,
        allUsers: res.body,
        gettingUsersInProgress: false,
        listUserErrorDetails: null,
        onlineUsers,
        offlineUsers
      };
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
      const res: BaseResponse<any, any> = action.payload;
      if (res && res.body) {
        res.body.sort((a, b) => {
          let column = 'name';
          let ar;
          if (typeof a[column] === 'string' && typeof b[column] === 'string') {
            ar = compare(a[column].toLocaleLowerCase(), b[column].toLocaleLowerCase());
          } else {
            ar = compare(a[column], b[column]);
          }
          return ar;
        });
        return { ...state, folders: res.body, gettingFoldersInProgress: false };
      }
      return {...state, gettingFoldersInProgress: false};
    }
    case USER_ACTIONS.GET_FILES_REQ: {
      return { ...state, files: [], gettingfileInProgress: true };
    }
    case USER_ACTIONS.GET_FILES_RES: {
      const res: BaseResponse<IFileFormRes[], any> = action.payload;
      if (res && res.body) {
        res.body.sort((a, b) => {
          let column = 'lastModified';
          let ar;
          if (typeof a[column] === 'string' && typeof b[column] === 'string') {
            ar = compare(a[column].toLocaleLowerCase(), b[column].toLocaleLowerCase());
          } else {
            ar = compare(a[column], b[column]);
          }
          return -ar;
        });
        return { ...state, files: res.body, gettingfileInProgress: false };
      }
      return {...state, gettingfileInProgress: false};
    }
    case USER_ACTIONS.TRIGGER_GET_FILES_REQ: {
      return { ...state, triggerFileReq: action.payload };
    }
    case USER_ACTIONS.TRIGGER_GET_FOLDER_REQ: {
      return { ...state, triggerFolderReq: action.payload };
    }
    case USER_ACTIONS.SET_ACTIVE_USER: {
      return { ...state, activeUser: action.payload };
    }
    default: {
      return state;
    }
  }
}
