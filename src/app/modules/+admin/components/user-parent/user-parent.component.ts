import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { takeUntil, take, filter, distinctUntilChanged } from 'rxjs/operators';
import { IUserList, IS3FilesReq, IFileFormRes, BaseResponse, ISuccessRes, IBreadCrumb, ICreateFolderDetails } from 'src/app/models';
import { find, last, cloneDeep } from 'src/app/lodash.optimized';
import { MY_FILES } from 'src/app/app.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/services/upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services';
import { ToastrService } from 'ngx-toastr';
import { CreateFolderModalComponent } from 'src/app/modules/+drive/components/create-folder';
import { TranslateService } from '@ngx-translate/core';
import { LocalService } from 'src/app/services/local.service';

@Component({
  styleUrls: ['./user-parent.component.scss'],
  templateUrl: './user-parent.component.html'
})
export class UserParentComponent implements OnInit, OnDestroy {
  public maxLimitReached: boolean;
  public uploadPath: string;
  public breadCrumbData: IBreadCrumb[];
  public onSingleLevel: boolean;
  public searchString: string;
  public folderCreationInProgress: boolean;
  public modalRef: any;
  public form: FormGroup;
  public activeUser: IUserList;
  public allUsers: IUserList[];
  public foldersList$: Observable<ICreateFolderDetails[]>;
  public foldersList: ICreateFolderDetails[];
  public filesList$: Observable<IFileFormRes[]>;
  private isCalled: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private localService: LocalService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private store: Store<AppState>,
    private userActions: UserActions,
    private modalService: NgbModal,
    private uploadService: UploadService,
    private userService: UserService
  ) {
    // listen on folders
    this.foldersList$ = this.store.pipe(select(p => p.user.folders), takeUntil(this.destroyed$));
    // listen on s3 files
    this.filesList$ = this.store.pipe(select(p => p.user.files), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    this.initForm();

    // listen for params and find active user
    combineLatest([
      this.route.params.pipe(takeUntil(this.destroyed$)),
      this.store.pipe(select(p => p.user.allUsers), takeUntil(this.destroyed$))
    ]).subscribe(resp => {
      const params = resp[0];
      this.allUsers = resp[1];
      if (params && params['userId'] && this.allUsers && this.allUsers.length) {
        this.findActiveUser(+params['userId']);
      }
    });

    // listen
    combineLatest([
      this.store.pipe(
        select(p => p.user.folders),
        distinctUntilChanged((p: any[], q: any[]) => {
          if (!p && q) {
            return false;
          } else if (p && q) {
            return p.length === q.length;
          }
        })
      ),
      this.store.pipe(select(p => p.user.activeUser), takeUntil(this.destroyed$))
    ])
    .subscribe(resp => {
      this.foldersList = resp[0];
      if (resp[1] && this.foldersList) {
        this.setVal();
      }
    });

    // listen on child
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.setVal(this.router.routerState.snapshot);
      }
    });

    // listen for trigger request and get folders
    this.store.pipe(select(p => p.user.triggerFolderReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        this.getS3Folders();
      }
    });

    // listen for trigger request and get files
    this.store.pipe(select(p => p.user.triggerFileReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        if (this.breadCrumbData && this.breadCrumbData.length) {
          const obj = last(this.breadCrumbData);
          if (obj) {
            this.getS3Files(obj.id);
            return;
          }
        } else {
          this.getS3Files(MY_FILES);
        }
      }
    });
  }

  public openModal() {
    if (this.activeUser) {
      let modalRef = this.modalService.open(CreateFolderModalComponent, { windowClass: 'customPrimary' });
      modalRef.componentInstance.activePath = this.getPath();
      modalRef.componentInstance.activeUserEmail = this.activeUser.email;
      modalRef.componentInstance.activeUserId = this.activeUser.id;
      modalRef.componentInstance.breadCrumbData = this.breadCrumbData;
    }
  }

  public navigateToUser(): void {
    this.router.navigate([`/admin/drive/external/user/${this.activeUser.id}`]);
  }

  public navigateTo(o: any): void {
    let u = `/admin/drive/external/user/${this.activeUser.id}`;
    this.breadCrumbData.forEach((item, index) => {
      if (index <= o.level) {
        u += `/${item.id}`;
      }
    });
    this.router.navigate([u]);
  }

  private setVal(r?: RouterStateSnapshot) {
    // iterate over all childrens
    this.route.children.forEach((item: ActivatedRoute) => {
      item.params.pipe(take(1))
      .subscribe(params => {
        if (params['userId']) {
          this.onSingleLevel = true;
          this.breadCrumbData = [];
          this.uploadPath = null;
          this.getS3Files(MY_FILES);
        } else {
          this.onSingleLevel = false;
          this.breadCrumbData = [];
          Object.keys(params).forEach((key, idx) => {
            let o = {
              level: idx,
              id: params[key],
              value: this.getNameOfFolder(params[key], this.foldersList)
            };
            this.breadCrumbData.push(o);
          });
          this.maxLimitReached = (this.breadCrumbData.length === 5) ? true : false;
          setTimeout(() => {
            const obj = last(this.breadCrumbData);
            if (obj) {
              this.getS3Files(obj.id);
            }
          }, 500);
          setTimeout(() => {
            this.uploadPath = this.getPath();
          }, 1500);
        }
      });
    });
  }

  private getNameOfFolder(id, arr: ICreateFolderDetails[]): string {
    const data = this.localService.findItemRecursively(arr, id);
    return (data && data.name) ? data.name : 'bingo';
  }

  private getPath(): string {
    let path;
    if (this.activeUser && this.breadCrumbData) {
      path = `${this.activeUser.email}`;
      this.breadCrumbData.forEach((item, index) => {
        path += `/${item.id}`;
      });
    }
    return path;
  }

  private findActiveUser(id: number) {
    const o = find(this.allUsers, ['id', id]);
    if (o) {
      if (this.activeUser && this.activeUser.id !== o.id) {
        this.isCalled = false;
      }
      this.activeUser = cloneDeep(o);
      this.uploadPath = this.getPath();
      this.store.dispatch(this.userActions.setActiveUser(o));
      if (!this.isCalled) {
        this.isCalled = true;
        this.getS3Folders();
      }
    } else {
      console.log('user not found');
    }
  }

  private getS3Folders() {
    if (this.activeUser) {
      this.store.dispatch(this.userActions.getFoldersReq(this.activeUser.id.toString()));
    }
  }

  private getS3Files(folderName) {
    let obj: IS3FilesReq = {
      folderName,
      userId: this.activeUser.id.toString()
    };
    this.store.dispatch(this.userActions.getFilesReq(obj));
  }

  private initForm() {
    this.form = this.fb.group({
      folderName: [null, Validators.required],
      description: [null]
    });
  }

}
