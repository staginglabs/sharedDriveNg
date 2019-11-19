import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions, UserActions } from 'src/app/actions';
import { IUserData } from 'src/app/models';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-user-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  public data: IUserData;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authActions: AuthActions,
    private userActions: UserActions
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

}
