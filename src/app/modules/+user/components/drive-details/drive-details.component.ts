import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { IS3FilesReq, IFileFormRes } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from 'src/app/components';

@Component({
  styleUrls: ['./drive-details.component.scss'],
  templateUrl: './drive-details.component.html'
})
export class DriveDetailsComponent implements OnInit, OnDestroy {
  public activeFolderName: string;
  public fileList: IFileFormRes[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private uploadService: UploadService,
    private modalService: NgbModal,
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen for user files
    this.store.pipe(select(p => p.user.files), takeUntil(this.destroyed$))
    .subscribe(d => {
      if (d && d.length) {
        this.fileList = d;
        console.log(this.fileList);
      }
    });

    // listen for trigger request
    this.store.pipe(select(p => p.user.triggerFileReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        this.prepareS3Req();
      }
    });

    // listen for user details
    // this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    // .subscribe(d => {
    //   console.log(d);
    // });

    // listen for params
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params) {
        if (params['driveId']) {
          this.activeFolderName = params['driveId'];
          this.getS3Files();
        } else {
          // redirect to some otehr route
        }
      }
    });
  }

  public downloadFile(item: IFileFormRes) {
    console.log('downloadFile');
    console.log(item);
    this.uploadService.downloadFile(item.key, item.displayName);
  }

  public deleteFile(item: IFileFormRes) {
    const modalRef = this.modalService.open(
      DeleteModalComponent,
      {
        windowClass: 'customPrimary'
      }
    );
    modalRef.componentInstance.type = 'file';
    modalRef.componentInstance.item = item;
    modalRef.result.then((res: any) => {
      console.log(res);
      // completed action and now do refresh actions
      if (res && res.action) {
        //
      }
    }).catch(err => {
      // console.log(err);
    });
  }

  private prepareS3Req() {
    this.route.params.pipe(take(1)).subscribe(params => {
      if (params) {
        if (params['driveId']) {
          this.activeFolderName = params['driveId'];
          this.getS3Files();
        }
      }
    });
  }

  private getS3Files() {
    let obj: IS3FilesReq = {
      folderName: this.activeFolderName
    };
    this.store.dispatch(this.userActions.getFilesReq(obj));
  }

}
