import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services';
import { BaseResponse, ISuccessRes, ICreateFolderDetails, IBreadCrumb, ICreateFolderReq } from 'src/app/models';
import { ToastrService } from 'ngx-toastr';
import { UserActions } from 'src/app/actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { TranslateService } from '@ngx-translate/core';
import { last } from 'src/app/lodash.optimized';

@Component({
  styleUrls: ['./create-folder-modal.component.scss'],
  templateUrl: './create-folder-modal.component.html'
})
export class CreateFolderModalComponent implements OnInit, OnDestroy {
  @Input() public activeUserEmail: string;
  @Input() public activeUserId: number;
  @Input() public activePath: string;
  @Input() public breadCrumbData: IBreadCrumb[];
  public form: FormGroup;
  public folderCreationInProgress: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private toast: ToastrService,
    private uploadService: UploadService,
    private userService: UserService,
    private store: Store<AppState>,
    private userActions: UserActions,
  ) {}


  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    this.initForm();
  }

  public dismissModal() {
    this.modal.close();
  }

  public createFolder() {
    if (this.form.valid) {
      this.folderCreationInProgress = true;
      const data: ICreateFolderDetails = this.form.value;
      const name = data.name.trim();
      let key = `${this.activePath}/${name}/`;
      data.id = `${new Date().getTime()}_${name}`;
      this.uploadService.createFolder(key)
      .then(res => {
        this.createFolderEntry(data);
      })
      .catch(err => {
        console.log(err);
        this.folderCreationInProgress = false;
      });
    }
  }

  private getuuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable-next-line: no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line: no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private initForm() {
    this.form = this.fb.group({
      name: [null, Validators.required],
      description: [null]
    });
  }

  private createFolderEntry(obj: ICreateFolderDetails) {
    const o: ICreateFolderReq = {
      userId: this.activeUserId,
      data: obj
    };
    if (this.breadCrumbData && this.breadCrumbData.length) {
      const d = last(this.breadCrumbData);
      o.parentId = d.id;
    }
    o.data.childrens = [];
    this.userService.createFolderForUser(o)
    .then((res: BaseResponse<ISuccessRes, any>) => {
      this.getS3Folders();
      this.folderCreationInProgress = false;
      this.dismissModal();
      this.toast.success(res.body.message, 'success');
    })
    .catch((e: BaseResponse<any, any>) => {
      this.folderCreationInProgress = false;
      console.log(e);
      // try {
      //   this.toast.error(e.error.message, 'Error');
      // } catch (error) {
      // }
    });
  }

  private getS3Folders() {
    if (this.activeUserId) {
      this.store.dispatch(this.userActions.getFoldersReq(this.activeUserId.toString()));
    }
  }

}
