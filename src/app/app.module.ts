import { NgModule } from '@angular/core';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// third party libs
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { StoreRouterConnectingModule, RouterStateSerializer } from '@ngrx/router-store';

import { localStorageSync } from 'ngrx-store-localstorage';
import { reducers, customStorage } from './store';
import { StoreModule, MetaReducer, ActionReducer } from '@ngrx/store';
import { ActionModule } from './actions/action.module';
import { CustomActions, AUTH_ACTIONS } from './actions';
import { ALL_COMPONENTS } from './components';
import { AuthInterceptor } from './auth.interceptor';


export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({ keys: ['auth'], rehydrate: true, storage: customStorage })(reducer);
}
export function clearState(reducer: ActionReducer<any>): ActionReducer<any> {
  // tslint:disable-next-line: only-arrow-functions
  return function(state: any, action: CustomActions): any {
    if (action.type === AUTH_ACTIONS.SIGN_OUT) {
      state = undefined;
    }
    return reducer(state, action);
  };
}
const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer, clearState];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    ALL_COMPONENTS
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    // Store modules
    ActionModule.forRoot(),
    // StoreRouterConnectingModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
          useFactory: createTranslateLoader, // exported factory function needed for AoT compilation
          deps: [HttpClient]
      }
    })
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  entryComponents: [
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
