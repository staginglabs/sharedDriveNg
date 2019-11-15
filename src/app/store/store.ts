import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';

// import store files here
import { AuthState, authReducer } from './auth.reducer';
import { UserState, userReducer } from './user.reducer';

export interface AppState {
  router: fromRouter.RouterReducerState;
  auth: AuthState;
  user: UserState;
}

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  auth: authReducer,
  user: userReducer
};

