import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, distinctUntilChanged } from 'rxjs/operators';
import { IS3FilesReq, IFileFormRes, IUserList, IUserData, IUserDetailsData, ICreateFolderDetails } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { find, last, cloneDeep } from 'src/app/lodash.optimized';
import { CreateFolderModalComponent } from '../create-folder';
import { TranslateService } from '@ngx-translate/core';
import { MY_FILES } from 'src/app/app.constant';
import { LocalService } from 'src/app/services/local.service';

@Component({
  styleUrls: ['./drive-details.component.scss'],
  templateUrl: './drive-details.component.html'
})
export class DriveDetailsComponent implements OnInit, OnDestroy {
  public showBreadCrumb = true;
  public showDeepBreadCrumb = true;
  public activeFolderName: string;
  public activeFolderData: any;
  public filesList$: Observable<IFileFormRes[]>;
  public searchString: string;
  public activeUser: IUserList;
  public activeUserId: string;
  public userData: IUserDetailsData;
  public allUsers$: Observable<IUserList[]>;
  public breadCrumbData: any[];
  public uploadPath: string;
  public maxLimitReached: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private localService: LocalService,
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
      this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$)),
      this.store.pipe(
        select(p => p.user.folders),
        // takeUntil(this.destroyed$)
        distinctUntilChanged((p: any[], q: any[]) => {
          if (!p && q) {
            return false;
          } else if (p && q) {
            return p.length === q.length;
          }
        })
      )
    ])
    .subscribe((arr: any[]) => {
      this.activeFolderName = MY_FILES;
      this.uploadPath = null;
      const params = arr[0];
      this.userData = arr[1];
      if (params && this.userData && arr[2]) {
        let o: string = last(Object.values(cloneDeep(params)));
        if (o) {
          this.activeFolderName = o;
          this.getS3Files();
          this.getActiveFolderData(o, arr[2]);

          // prepare breadcrumb
          this.breadCrumbData = [];
          Object.keys(params).forEach((key, idx) => {
            let i = {
              level: idx,
              id: params[key],
              value: this.getNameOfFolder(params[key], arr[2])
            };
            this.breadCrumbData.push(i);
          });
          this.maxLimitReached = (this.breadCrumbData.length === 5) ? true : false;
          setTimeout(() => {
            this.uploadPath = this.getPath();
          }, 1000);
        }
      }
    });

    // listen for trigger request and get files
    this.store.pipe(select(p => p.user.triggerFileReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        this.getS3Files();
      }
    });

    this.uriUtils(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.uriUtils(this.router.routerState.snapshot);
      }
    });

  }

  public navigateTo(o: any): void {
    let u = `/user/shared-drive`;
    this.breadCrumbData.forEach((item, index) => {
      if (index <= o.level) {
        u += `/${item.id}`;
      }
    });
    this.router.navigate([u]);
  }

  public openModal() {
    let modalRef = this.modalService.open(CreateFolderModalComponent, { windowClass: 'customPrimary' });
    modalRef.componentInstance.activeUserEmail = (this.activeUser) ? this.activeUser.email : this.userData.user_email;
    modalRef.componentInstance.activeUserId = (this.activeUser) ? this.activeUser.id : +this.userData.id;
  }

  public goBack(e: any) {
    if (e) {
      this.location.back();
    }
  }

  private uriUtils(r: RouterStateSnapshot) {
    if (r.url.includes('/admin/shared-drive')) {
      this.showBreadCrumb = false;
    } else {
      this.showBreadCrumb = true;
    }
  }

  private getS3Files() {
    this.activeUserId = (this.activeUser) ? this.activeUser.id.toString() : this.userData.id;
    let obj: IS3FilesReq = {
      folderName: this.activeFolderName,
      userId: this.activeUserId
    };
    this.store.dispatch(this.userActions.getFilesReq(obj));
  }

  private getActiveFolderData(id, res: any[]) {
    this.activeFolderData = null;
    if (id && id !== MY_FILES) {
      if (res && res.length) {
        this.activeFolderData = this.localService.findItemRecursively(res, id);
      }
    }
  }

  private getNameOfFolder(id, arr: ICreateFolderDetails[]): string {
    const data = this.localService.findItemRecursively(arr, id);
    return (data && data.name) ? data.name : 'bingo';
  }

  private getPath(): string {
    let path;
    if (this.userData && this.breadCrumbData) {
      path = `${this.userData.user_email}`;
      this.breadCrumbData.forEach((item, index) => {
        path += `/${item.id}`;
      });
    }
    return path;
  }

}
