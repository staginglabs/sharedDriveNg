import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot, NavigationEnd } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UserActions } from 'src/app/actions';
import { TranslateService } from '@ngx-translate/core';
import { IUserDetailsData, ICreateFolderDetails } from 'src/app/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from 'src/app/components/delete-modal';

@Component({
  styleUrls: ['./shared-drive.component.scss'],
  templateUrl: './shared-drive.component.html'
})
export class SharedDriveComponent implements OnInit, OnDestroy {
  public userData: IUserDetailsData;
  public gettingFoldersInProgress$: Observable<boolean>;
  public foldersList$: Observable<ICreateFolderDetails[]>;
  public isChildRouteActivated = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private router: Router,
    private store: Store<AppState>,
    private modalService: NgbModal,
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

    // listen for token and user details
    this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      this.userData = d;
      // get user folders
      if (d) {
        this.store.dispatch(this.userActions.getFoldersReq(d.id));
      }
    });

    // listen for trigger request and get folders
    this.store.pipe(select(p => p.user.triggerFolderReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        this.store.dispatch(this.userActions.getFoldersReq(this.userData.id));
      }
    });


    this.setVal(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.setVal(this.router.routerState.snapshot);
      }
    });
  }

  public deleteFolder(item: any) {
    let key = `${this.userData.user_email}/${item.name}/`;
    const modalRef = this.modalService.open(
      DeleteModalComponent,
      {
        windowClass: 'customWarning'
      }
    );
    modalRef.componentInstance.folderName = key;
    modalRef.componentInstance.type = 'folder';
    modalRef.componentInstance.displayName = item.name;
    modalRef.componentInstance.userId = this.userData.id.toString();
  }

  private setVal(r: RouterStateSnapshot) {
    if (r.url === '/user/shared-drive') {
      this.isChildRouteActivated = false;
    } else {
      this.isChildRouteActivated = true;
    }
    if (r.url === '/admin/shared-drive') {
      this.router.navigate([`/admin/shared-drive/drive/myfiles`]);
    }
  }

}
