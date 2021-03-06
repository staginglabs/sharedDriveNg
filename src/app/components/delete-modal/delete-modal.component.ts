﻿import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IFileFormRes, BaseResponse, ISuccessRes } from 'src/app/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./delete-modal.component.scss'],
  templateUrl: './delete-modal.component.html'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @Input() public displayName: string;
  @Input() public folderName: string;
  @Input() public type: string;
  @Input() public item: IFileFormRes;
  @Input() public folderId: string;
  @Input() public userId: string;
  public actionInProgress: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
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
    // console.log(this.folderName);
    // console.log(this.userId);
    // console.log(this.displayName);
  }

  public closeModal(reason: string) {
    this.modal.close(reason);
  }

  public doDelete() {
    this.actionInProgress = true;
    if (this.type === 'file') {
      this.deleteFileFromS3();
      this.doS3FileDelete();
    } else {
      const key =  (this.type === 'folder') ? `${this.folderName}/${this.folderId}` : this.folderName;
      this.uploadService.deleteS3Object(this.folderName)
      .then(res => {
        if (this.type === 'folder') {
          this.deleteObjects();
        } else {
          this.deleteUser();
        }
      })
      .catch(console.log);
    }
  }

  private deleteUser() {
    const obj = {
      userId: this.item.id
    };
    this.userService.deleteUser(obj)
    .then((res: BaseResponse<ISuccessRes, any>) => {
      this.actionInProgress = false;
      this.getUsers();
      this.toast.success('Usuarios Archivos compartidos ¡borrado exitosamente!', 'success');
      this.modal.close({action: this.type, msg: 'USER_DELETED'});
    })
    .catch((e: BaseResponse<any, any>) => {
      this.actionInProgress = false;
      try {
        this.toast.error(e.error.message, 'Error');
      } catch (error) {
        console.log(error);
      }
    });
  }

  private deleteObjects() {
    let obj = {
      folderId: this.folderId,
      userId: this.userId
    };
    this.userService.deleteUserFolder(obj)
    .then((res: BaseResponse<ISuccessRes, any>) => {
      this.actionInProgress = false;
      this.getS3Folders();
      this.toast.success('Carpeta eliminada con éxito!', 'success');
      this.modal.close({action: this.type, msg: 'FOLDER_DELETED'});
    })
    .catch((e: BaseResponse<any, any>) => {
      this.actionInProgress = false;
      try {
        this.toast.error(e.error.message, 'Error');
      } catch (error) {
        console.log(error);
      }
    });
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
      this.actionInProgress = false;
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

  private getS3Folders() {
    // initiate folder req and reset after a delay
    this.store.dispatch(this.userActions.triggerFolderReq(true));
    setTimeout(() => {
      this.store.dispatch(this.userActions.triggerFolderReq(false));
    }, 1000);
  }

  private getUsers() {
    this.store.dispatch(this.userActions.getUsersReq());
  }

}
