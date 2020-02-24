import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions } from 'src/app/actions';
import { ISignInRequest } from 'src/app/models';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  template: `<p class="lead">Loading...</p>`
  // styleUrls: ['./dummy.component.scss'],
  // templateUrl: './dummy.component.html'
})
export class DummyComponent implements OnInit, OnDestroy {
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
    this.store.pipe(select(p => p.auth), takeUntil(this.destroyed$))
    .subscribe(state => {
      if (state.token && state.details) {
        if (state.details.is_admin) {
          this.router.navigate(['/admin/shared-drive/myfiles']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

}
