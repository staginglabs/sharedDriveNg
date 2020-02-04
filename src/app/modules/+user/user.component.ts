import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { last } from 'src/app/lodash.optimized';

@Component({
  styleUrls: ['./user.component.scss'],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
  public showBreadCrumb: boolean;
  public activePageTitle: string;
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
    this.setVal(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.setVal(this.router.routerState.snapshot);
      }
    });
  }

  private setVal(r: RouterStateSnapshot) {
    if (r && r.url) {
      let arr = r.url.split('/');
      let page = last(arr);
      this.showBreadCrumb = (page === 'dashboard') ? false : true;
      if (page === 'account-details') {
        page = 'accountDetails';
      }
      if (page === 'shared-drive') {
        page = 'sharedDrive';
      }
      let str = `cmn.${page}`;
      this.activePageTitle = this.translate.instant(str);
    }
  }

}
