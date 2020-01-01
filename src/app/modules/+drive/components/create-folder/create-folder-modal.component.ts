import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services';
import { BaseResponse, ISuccessRes } from 'src/app/models';
import { ToastrService } from 'ngx-toastr';
import { UserActions } from 'src/app/actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./create-folder-modal.component.scss'],
  templateUrl: './create-folder-modal.component.html'
})
export class CreateFolderModalComponent implements OnInit, OnDestroy {
  @Input() public activeUserEmail: string;
  @Input() public activeUserId: number;
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
      const data: any = this.form.value;
      const name = data.folderName.trim();
      let key = `${this.activeUserEmail}/${name}/`;
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

  private initForm() {
    this.form = this.fb.group({
      folderName: [null, Validators.required],
      description: [null]
    });
  }

  private createFolderEntry(obj: any) {
    obj.userId = this.activeUserId;
    this.userService.createFolderForUser(obj)
    .then((res: BaseResponse<ISuccessRes, any>) => {
      this.getS3Folders();
      this.folderCreationInProgress = false;
      this.toast.success(res.body.message, 'success');
      this.dismissModal();
    })
    .catch((e: BaseResponse<any, any>) => {
      this.folderCreationInProgress = false;
      try {
        this.toast.error(e.error.message, 'Error');
      } catch (error) {
        console.log(error);
      }
    });
  }

  private getS3Folders() {
    if (this.activeUserId) {
      this.store.dispatch(this.userActions.getFoldersReq(this.activeUserId.toString()));
    }
  }

}
