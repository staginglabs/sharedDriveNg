﻿import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IUserData } from 'src/app/models';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-nav',
  styleUrls: ['./admin-nav.component.scss'],
  templateUrl: './admin-nav.component.html'
})
export class AdminNavComponent implements OnInit, OnDestroy, AfterViewInit {
  public isSmallScreen: boolean;
  public toggleNavbar: boolean;
  public user: IUserData;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private store: Store<AppState>,
    private authActions: AuthActions
  ) {
  }
  @HostListener('window:resize', [])
  public onResize() {
    this.detectScreenSize();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.detectScreenSize();
    }, 300);
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // listen for logged in user
    this.store.pipe(select(p => p.auth.details), takeUntil(this.destroyed$))
    .subscribe(res => {
      this.user = res;
    });
  }

  public logout() {
    this.store.dispatch(this.authActions.signOut());
  }

  private detectScreenSize() {
    this.isSmallScreen = (window.innerWidth < 768) ? true : false;
  }

}
