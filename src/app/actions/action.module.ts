import { ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';

// import all actions here
import { AuthActions } from './auth.action';
import { UserActions } from './user.action';

@NgModule({
  imports: [
    EffectsModule.forRoot([
      AuthActions,
      UserActions
    ])
  ],
  exports: [EffectsModule]
})
export class ActionModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: ActionModule,
      providers: []
    };
  }
}
