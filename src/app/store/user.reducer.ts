import { CustomActions, USER_ACTIONS } from '../actions';
import { cloneDeep } from '../lodash.optimized';
import {
  BaseResponse, IIOrderRootRes,
  IOrderRes, IUserDetailsData, IUserDetailsRoot, ISuccessRes
} from '../models';

export interface UserState {
  orders: IOrderRes[];
  details: IUserDetailsData;
  updateProfileProgress: boolean;
}

const initialState: UserState = {
  orders: null,
  details: null,
  updateProfileProgress: false
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
    default: {
      return state;
    }
  }
}
