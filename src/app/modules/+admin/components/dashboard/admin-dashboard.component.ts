import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IUserList } from 'src/app/models';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./admin-dashboard.component.scss'],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  public allUsers$: Observable<IUserList[]>;
  public onlineUsers$: Observable<IUserList[]>;
  public offlineUsers$: Observable<IUserList[]>;
  public gettingUsersInProgress$: Observable<boolean>;
  public searchString: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private modalService: NgbModal
  ) {
    this.gettingUsersInProgress$ = this.store.pipe(select(p => p.user.gettingUsersInProgress), takeUntil(this.destroyed$));
    this.allUsers$ = this.store.pipe(select(p => p.user.allUsers), takeUntil(this.destroyed$));
    this.onlineUsers$ = this.store.pipe(select(p => p.user.onlineUsers), takeUntil(this.destroyed$));
    this.offlineUsers$ = this.store.pipe(select(p => p.user.offlineUsers), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    //
  }

}
