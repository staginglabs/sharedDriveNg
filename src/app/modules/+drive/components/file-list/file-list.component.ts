import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { IS3FilesReq, IFileFormRes } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesModalComponent } from '../notes-modal';
import { DeleteModalComponent } from 'src/app/components/delete-modal';

@Component({
  selector: 'app-file-list-view',
  styleUrls: ['./file-list.component.scss'],
  templateUrl: './file-list.component.html'
})
export class FileListComponent implements OnInit, OnDestroy {

  @Input() public fileList: IFileFormRes[];
  @Input() public searchString: string;

  public gettingfileInProgress$: Observable<boolean>;
  public activeFolderName: string;
  public modalRef: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private uploadService: UploadService,
    private modalService: NgbModal,
  ) {
    this.gettingfileInProgress$ = this.store.pipe(select(p => p.user.gettingfileInProgress), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen for trigger request
    this.store.pipe(select(p => p.user.triggerFileReq), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res) {
        this.prepareS3Req();
      }
    });

    // listen for params
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params) {
        if (params['driveId']) {
          this.activeFolderName = params['driveId'];
        }
      }
    });
  }

  public openNotesModal(item: IFileFormRes) {
    if (item) {
      const modalRef = this.modalService.open(
        NotesModalComponent,
        {
          windowClass: 'customPrimary'
        }
      );
      modalRef.componentInstance.item = item;
      modalRef.result.then((res: any) => {
        console.log(res);
      });
    }
  }

  public downloadFile(item: IFileFormRes) {
    this.uploadService.downloadFile(item.key, item.displayName);
  }

  public deleteFile(item: IFileFormRes) {
    const modalRef = this.modalService.open(
      DeleteModalComponent,
      {
        windowClass: 'customPrimary'
      }
    );
    modalRef.componentInstance.folderName = this.activeFolderName;
    modalRef.componentInstance.type = 'file';
    modalRef.componentInstance.item = item;
    modalRef.result.then((res: any) => {
      //
    }).catch(err => {
      // console.log(err);
    });
  }

  private prepareS3Req() {
    this.route.params.pipe(take(1)).subscribe(params => {
      console.log(params);
      if (params) {
        // if (params['driveId']) {
        //   this.activeFolderName = params['driveId'];
        //   this.getS3Files();
        // }
      }
    });
  }

  private getS3Files() {
    let obj: IS3FilesReq = {
      folderName: this.activeFolderName,
      userId: '1'
    };
    this.store.dispatch(this.userActions.getFilesReq(obj));
  }

}
