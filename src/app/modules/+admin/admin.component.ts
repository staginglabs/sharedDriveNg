import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot, NavigationEnd } from '@angular/router';
import { takeUntil, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./admin.component.scss'],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {
  public heading: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private store: Store<AppState>,
    private userActions: UserActions,
    private router: Router,
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

    this.setVal(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.setVal(this.router.routerState.snapshot);
      }
    });
  }

  private setVal(r: RouterStateSnapshot) {
    if (r.url.indexOf('/admin/shared-drive') !== -1) {
      this.heading = this.translate.instant('cmn.int');
    } else {
      this.heading = this.translate.instant('cmn.ext');
    }
  }

}
