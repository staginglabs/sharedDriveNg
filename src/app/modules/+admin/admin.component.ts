import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';

@Component({
  styleUrls: ['./admin.component.scss'],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private store: Store<AppState>,
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
  }

}
