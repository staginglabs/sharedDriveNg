import { CustomActions, USER_ACTIONS } from '../actions';
import { cloneDeep } from '../lodash.optimized';
import { BaseResponse, IIOrderRootRes, IOrderRes } from '../models';

export interface UserState {
  orders: IOrderRes[];
  details: any;
}

const initialState: UserState = {
  orders: null,
  details: null,
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
      const res: BaseResponse<IIOrderRootRes, any> = action.payload;
      // if (res && res.data && res.data.data && res.data.data.length) {
      //   return { ...state, details: res.data.data[0] };
      // }
      return state;
    }
    case USER_ACTIONS.UPDATE_PROFILE_REQ: {
      return state;
    }
    case USER_ACTIONS.UPDATE_PROFILE_RES: {
      const res: any = action.payload;
      if (res && res.data && res.successful) {
        return { ...state, details: res.data };
      }
      return state;
    }
    default: {
      return state;
    }
  }
}
