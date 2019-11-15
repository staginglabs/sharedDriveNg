import { AUTH_ACTIONS, CustomActions } from '../actions';
import { cloneDeep } from '../lodash.optimized';
import {
  ISignInResponse, BaseResponse,
  ISignInRequest, IUserData
} from '../models';

export interface AuthState {
  token: string;
  details: IUserData;
  loginErrMsg: string;
}

const initialState: AuthState = {
  token: null,
  details: null,
  loginErrMsg: null
};

export function authReducer(state = initialState, action: CustomActions): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.EMPTY_ACTION: {
      return state;
    }
    case AUTH_ACTIONS.SIGNIN_REQUEST: {
      return { ...state, loginErrMsg: null };
    }
    case AUTH_ACTIONS.SIGNIN_RESPONSE: {
      const res: BaseResponse<ISignInResponse, ISignInRequest> = action.payload;
      if (res.status === 200) {
        return { ...state, token: res.body.token, details: res.body.data };
      } else {
        return { ...state, loginErrMsg: res.error.message };
      }
    }
    case AUTH_ACTIONS.SIGN_OUT: {
      let newState = cloneDeep(state);
      state = newState;
      return newState;
    }
    case AUTH_ACTIONS.SET_TOKEN: {
      const token = action.payload;
      return { ...state, token };
    }
    default: {
      return state;
    }
  }
}
