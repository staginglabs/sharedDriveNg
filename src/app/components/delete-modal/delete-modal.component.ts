import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IFileFormRes, BaseResponse, ISuccessRes } from 'src/app/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  styleUrls: ['./delete-modal.component.scss'],
  templateUrl: './delete-modal.component.html'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @Input() public displayName: string;
  @Input() public folderName: string;
  @Input() public type: string;
  @Input() public item: IFileFormRes;
  @Input() public userId: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public modal: NgbActiveModal,
    private userService: UserService,
    private toast: ToastrService,
    private store: Store<AppState>,
    private userActions: UserActions,
    private uploadService: UploadService
  ) {}


  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    console.log(this.userId);
  }

  public closeModal(reason: string) {
    this.modal.close(reason);
  }

  public doDelete() {
    if (this.type === 'file') {
      this.deleteFileFromS3();
      this.doS3FileDelete();
    } else {
      this.uploadService.deleteS3Object(this.folderName)
      .then(res => {
        if (this.type === 'folder') {
          this.toast.success('Folder deleted successfully!', 'success');
          this.modal.close({action: this.type, msg: 'FOLDER_DELETED'});
        } else {
          this.toast.success('User\'s shared drive deleted successfully!', 'success');
          this.modal.close({action: this.type, msg: 'USER_DELETED'});
        }
      })
      .catch(console.log);
    }
  }

  private deleteFileFromS3() {
    let key = `${this.item.key}/`;
    this.uploadService.deleteS3Object(key);
  }

  private doS3FileDelete() {
    let obj = {
      id: this.item.id,
      folderName: this.folderName,
      userId: this.userId
    };
    this.userService.deleteUsersS3Files(obj)
    .then((res: BaseResponse<ISuccessRes, any>) => {
      this.toast.success(res.body.message, res.body.status);
      this.modal.close({action: this.type, msg: 'FILE_DELETED'});
      this.getS3Files();
    })
    .catch((e: BaseResponse<any, any>) => {
      try {
        this.toast.error(e.error.error.message, 'Error');
      } catch (error) {
        console.log(error);
      }
    });
  }

  private getS3Files() {
    // initiate get files req and reset after a delay
    this.store.dispatch(this.userActions.triggerFileReq(true));
    setTimeout(() => {
      this.store.dispatch(this.userActions.triggerFileReq(false));
    }, 1000);
  }

}
