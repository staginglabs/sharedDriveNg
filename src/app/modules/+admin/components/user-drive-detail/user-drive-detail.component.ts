import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject, Observable, combineLatest, of } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { IUserList, IFileFormRes, ICreateFolderDetails } from 'src/app/models';
import { find, last } from 'src/app/lodash.optimized';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/services/upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LocalService } from 'src/app/services/local.service';

@Component({
  styleUrls: ['./user-drive-detail.component.scss'],
  templateUrl: './user-drive-detail.component.html'
})
export class UserDriveDetailComponent implements OnInit, OnDestroy {
  public activeParent: ICreateFolderDetails;
  public maxLimitReached: boolean;
  public breadCrumbData: any[];
  public searchString: string;
  public folderCreationInProgress: boolean;
  public modalRef: any;
  public form: FormGroup;
  public activeUser: IUserList;
  public allUsers$: Observable<IUserList[]>;
  public foldersList$: Observable<ICreateFolderDetails[]>;
  public filesList$: Observable<IFileFormRes[]>;
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
    // listen on s3 files
    this.filesList$ = this.store.pipe(select(p => p.user.files), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // listen for params and find active user
    this.store.pipe(select(p => p.user.activeUser), takeUntil(this.destroyed$))
    .subscribe(data => {
      this.activeUser = data;
    });

    // toggle things as per conditions
    combineLatest([
      this.route.params.pipe(takeUntil(this.destroyed$)),
      this.store.pipe(select(p => p.user.folders), takeUntil(this.destroyed$))
    ])
    .subscribe((arr: any[]) => {
      const params = arr[0];
      const data = arr[1];
      if (params && data && data.length) {
        if (params['userId']) {
          this.breadCrumbData = [];
        } else {
          this.breadCrumbData = [];
          Object.keys(params).forEach((key, idx) => {
            let o = {
              level: idx,
              id: params[key],
              value: this.getNameOfFolder(params[key], data)
            };
            this.breadCrumbData.push(o);
          });
        }
        this.maxLimitReached = (this.breadCrumbData.length === 5) ? true : false;
        this.arrangeFolderList(data);
      }
    });
  }

  private getNameOfFolder(id, arr: ICreateFolderDetails[]): string {
    const data = this.localService.findItemRecursively(arr, id);
    return (data && data.name) ? data.name : 'bingo';
  }

  private arrangeFolderList(arr: ICreateFolderDetails[]) {
    this.foldersList$ = of([]);
    if (this.breadCrumbData.length) {
      if (this.breadCrumbData.length <= 5) {
        this.sortFolderByHeirarchy(arr);
      }
    } else {
      this.foldersList$ = of(arr);
    }
  }

  private sortFolderByHeirarchy(arr: ICreateFolderDetails[]) {
    this.activeParent = null;
    const obj = last(this.breadCrumbData);
    this.activeParent = this.localService.findItemRecursively(arr, obj.id);
    // console.log(this.activeParent);
    if (this.activeParent) {
      this.foldersList$ = of(this.activeParent.childrens);
    }
  }

}
