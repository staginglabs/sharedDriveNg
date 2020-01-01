import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions, AuthActions } from 'src/app/actions';
import { IUserData } from 'src/app/models';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  public data: IUserData;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private store: Store<AppState>,
    private userActions: UserActions,
    private authActions: AuthActions
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen for token
    this.store.pipe(select(p => p.auth.token), takeUntil(this.destroyed$))
    .subscribe(d => {
      if (d) {
        this.store.dispatch(this.userActions.getProfileReq());
      }
    });

    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      this.data = d;
    });
  }

  public doLogout(e: any) {
    if (e) {
      this.store.dispatch(this.authActions.signOut());
    }
  }

  public changeLanguage(code) {
    console.log('changeLanguage:', code);
    this.translate.use(code);
  }

}
