import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { IUserList, IS3FilesReq, IFileFormRes } from 'src/app/models';
import { find } from 'src/app/lodash.optimized';
import { MY_FILES } from 'src/app/app.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadService } from 'src/app/services/upload.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DeleteModalComponent } from 'src/app/components/delete-modal';

@Component({
  styleUrls: ['./user-detail-view.component.scss'],
  templateUrl: './user-detail-view.component.html'
})
export class UserDetailViewComponent implements OnInit, OnDestroy {
  public modalRef: any;
  public form: FormGroup;
  public activeUser: IUserList;
  public allUsers$: Observable<IUserList[]>;
  public foldersList$: Observable<string[]>;
  public filesList$: Observable<IFileFormRes[]>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private modalService: NgbModal,
    private uploadService: UploadService
  ) {
    this.allUsers$ = this.store.pipe(select(p => p.user.allUsers), takeUntil(this.destroyed$));
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
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params) {
        if (params['userId']) {
          this.findActiveUser(+params['userId']);
        } else {
          // redirect to some otehr route
          // this.router.navigate(['admin', 'drive', 0, 'user', item.id]);
        }
      }
    });
  }

  public openModal(template: any) {
    this.modalRef = this.modalService.open(template, { windowClass: 'customPrimary' });
  }

  public dismissModal() {
    this.modalRef.close();
  }

  public deleteFolder(item) {
    let key = `${this.activeUser.email}/${item}/`;
    const modalRef = this.modalService.open(
      DeleteModalComponent,
      {
        windowClass: 'customWarning'
      }
    );
    modalRef.componentInstance.folderName = key;
    modalRef.componentInstance.type = 'folder';
    modalRef.componentInstance.displayName = item;
    modalRef.result.then((res: any) => {
      //
    }).catch(err => {
      // console.log(err);
    });
  }

  public createFolder() {
    if (this.form.valid) {
      const data: any = this.form.value;
      let key = `${this.activeUser.email}/${data.folderName}/`;
      this.uploadService.createFolder(key)
      .then(res => {
        this.dismissModal();
      })
      .catch(err => {
        console.log(err);
      });
    }
  }

  private findActiveUser(id: number) {
    this.allUsers$.pipe(take(3)).subscribe(res => {
      if (res && res.length) {
        this.activeUser = find(res, ['id', id]);
        if (this.activeUser) {
          this.getS3Folders();
          this.getS3Files();
        } else {
          console.log('user not found');
        }
      }
    });
  }

  private getS3Folders() {
    this.store.dispatch(this.userActions.getFoldersReq(this.activeUser.id.toString()));
  }

  private getS3Files() {
    let obj: IS3FilesReq = {
      folderName: MY_FILES,
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
