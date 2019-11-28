import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UserActions } from 'src/app/actions';

@Component({
  styleUrls: ['./shared-drive.component.scss'],
  templateUrl: './shared-drive.component.html'
})
export class SharedDriveComponent implements OnInit, OnDestroy {
  public gettingFoldersInProgress$: Observable<boolean>;
  public foldersList$: Observable<string[]>;
  public isChildRouteActivated = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions
  ) {

    // listen on folders request
    this.gettingFoldersInProgress$ = this.store.pipe(select(p => p.user.gettingFoldersInProgress), takeUntil(this.destroyed$));
    // listen on folders
    this.foldersList$ = this.store.pipe(select(p => p.user.folders), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // get user folders
    this.store.dispatch(this.userActions.getFoldersReq());

    this.setVal(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.setVal(this.router.routerState.snapshot);
      }
    });
  }

  public downloadFolder(item) {
    console.log(item);
  }

  public deleteFolder(item) {
    console.log(item);
  }

  private setVal(r: RouterStateSnapshot) {
    this.isChildRouteActivated = (r.url === '/user/shared-drive') ? false : true;
  }

}
