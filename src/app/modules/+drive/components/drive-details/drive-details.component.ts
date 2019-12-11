import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { IS3FilesReq, IFileFormRes, IUserList, IUserData, IUserDetailsData } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { find } from 'src/app/lodash.optimized';

@Component({
  styleUrls: ['./drive-details.component.scss'],
  templateUrl: './drive-details.component.html'
})
export class DriveDetailsComponent implements OnInit, OnDestroy {
  public showBreadCrumb = true;
  public showDeepBreadCrumb = true;
  public activeFolderName: string;
  public filesList$: Observable<IFileFormRes[]>;
  public searchString: string;
  public activeUser: IUserList;
  public activeUserId: string;
  public userData: IUserDetailsData;
  public allUsers$: Observable<IUserList[]>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private uploadService: UploadService,
    private modalService: NgbModal,
    private location: Location
  ) {
    // listen for user files
    this.filesList$ = this.store.pipe(select(p => p.user.files), takeUntil(this.destroyed$));
    this.allUsers$ = this.store.pipe(select(p => p.user.allUsers), takeUntil(this.destroyed$));
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
    });

    // listen
    combineLatest([
      this.route.params.pipe(takeUntil(this.destroyed$)),
      this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    ])
    .subscribe((arr: any[]) => {
      const params = arr[0];
      this.userData = arr[1];
      if (params && this.userData) {
        if (params['driveId']) {
          this.activeFolderName = params['driveId'];
        }
        if (!params['userId']) {
          this.getS3Files();
        }
      }
    });

    // listen for trigger request and get files
    this.store.pipe(select(p => p.user.triggerFileReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        this.prepareS3Req();
      }
    });

    // listen for params
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params && params['driveId']) {
        this.activeFolderName = params['driveId'];
      }
      if (params && params['userId']) {
        this.findActiveUser(+params['userId']);
      }
    });

    this.uriUtils(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.uriUtils(this.router.routerState.snapshot);
      }
    });

  }

  public goBack(e: any) {
    if (e) {
      this.location.back();
    }
  }

  public goToUserDetailView() {
    if (this.activeUser) {
      this.router.navigate(['admin', 'drive', 'external', 'user', this.activeUser.id ]);
    }
  }

  private uriUtils(r: RouterStateSnapshot) {
    if (r.url.includes('/admin/shared-drive')) {
      this.showBreadCrumb = false;
    } else {
      this.showBreadCrumb = true;
    }

    this.showDeepBreadCrumb = (r.url.includes('/admin/drive/external/')) ? true : false;
  }

  private getS3Files() {
    this.activeUserId = (this.activeUser) ? this.activeUser.id.toString() : this.userData.id;
    let obj: IS3FilesReq = {
      folderName: this.activeFolderName,
      userId: this.activeUserId
    };
    this.store.dispatch(this.userActions.getFilesReq(obj));
    this.getS3Folders();
  }

  private findActiveUser(id: number) {
    this.allUsers$.pipe(take(3)).subscribe(res => {
      if (res && res.length) {
        this.activeUser = find(res, ['id', id]);
        if (this.activeUser && this.activeFolderName) {
          this.getS3Files();
        }
      }
    });
  }

  private getS3Folders() {
    if (this.activeUser) {
      this.store.dispatch(this.userActions.getFoldersReq(this.activeUser.id.toString()));
    }
  }

  private prepareS3Req() {
    this.getS3Files();
  }

}
