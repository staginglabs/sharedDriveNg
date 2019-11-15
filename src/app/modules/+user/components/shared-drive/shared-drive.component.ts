import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  styleUrls: ['./shared-drive.component.scss'],
  templateUrl: './shared-drive.component.html'
})
export class SharedDriveComponent implements OnInit, OnDestroy {
  public isChildRouteActivated = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
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
    this.isChildRouteActivated = (r.url === '/user/shared-drive') ? false : true;
  }

}
