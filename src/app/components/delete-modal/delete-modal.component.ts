import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IFileFormRes, BaseResponse, ISuccessRes } from 'src/app/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';

@Component({
  styleUrls: ['./delete-modal.component.scss'],
  templateUrl: './delete-modal.component.html'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @Input() public folderName: string;
  @Input() public type: string;
  @Input() public item: IFileFormRes;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public modal: NgbActiveModal,
    private userService: UserService,
    private toast: ToastrService,
    private store: Store<AppState>,
    private userActions: UserActions
  ) {}


  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    //
  }

  public closeModal(reason: string) {
    this.modal.close(reason);
  }

  public doDelete() {
    if (this.type === 'file') {
      this.doS3FileDelete();
    } else {
      //
    }
  }

  private doS3FileDelete() {
    let obj = {
      id: this.item.id,
      folderName: this.folderName
    };
    this.userService.deleteUsersS3Files(obj)
    .then((res: BaseResponse<ISuccessRes, any>) => {
      this.toast.success(res.body.message, res.body.status);
      this.getS3Files();
      this.modal.close({action: this.type, msg: 'FILE_DELETED'});
    })
    .catch(err => {
      console.log(err);
      this.toast.error('something went wrong!', 'Error');
    });
  }

  private getS3Files() {
    // initiate get files req and reset after a delay
    this.store.dispatch(this.userActions.triggerFileReq(true));
    setTimeout(() => {
      this.store.dispatch(this.userActions.triggerFileReq(true));
    }, 5000);
  }

}
