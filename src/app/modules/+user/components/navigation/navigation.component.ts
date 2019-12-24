import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-navigation',
  styleUrls: ['./navigation.component.scss'],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authActions: AuthActions
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // listen for token and user details
    this.store.pipe(select(p => p.auth.token), takeUntil(this.destroyed$))
    .subscribe(token => {
      if (!token) {
        this.router.navigate(['/login']);
      }
    });
  }

  public doLogout(e: any) {
    if (e) {
      this.store.dispatch(this.authActions.signOut());
    }
  }

}
