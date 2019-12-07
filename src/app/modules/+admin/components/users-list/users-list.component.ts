import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IUserList } from 'src/app/models';

@Component({
  selector: 'app-admin-users-list',
  styleUrls: ['./users-list.component.scss'],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit, OnDestroy {
  public isCollapsed = false;
  public isOfflineCollapsed = false;
  public allUsers$: Observable<IUserList[]>;
  public onlineUsers$: Observable<IUserList[]>;
  public offlineUsers$: Observable<IUserList[]>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
  ) {
    this.allUsers$ = this.store.pipe(select(p => p.user.allUsers), takeUntil(this.destroyed$));
    this.onlineUsers$ = this.store.pipe(select(p => p.user.onlineUsers), takeUntil(this.destroyed$));
    this.offlineUsers$ = this.store.pipe(select(p => p.user.offlineUsers), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // get users
    this.store.dispatch(this.userActions.getUsersReq());
  }

}
