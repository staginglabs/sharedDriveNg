import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { IFileFormRes } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesModalComponent } from '../notes-modal';
import { DeleteModalComponent } from 'src/app/components/delete-modal';
const SELECT_OPT = 'Please Select';

@Component({
  selector: 'app-file-list-view',
  styleUrls: ['./file-list.component.scss'],
  templateUrl: './file-list.component.html'
})
export class FileListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public userId: string;
  @Input() public fileList: IFileFormRes[];
  @Input() public searchString: string;
  @Input() public folderList: string[];
  public destinationFolder = SELECT_OPT;
  public selectedItemToMove: IFileFormRes;
  public gettingfileInProgress$: Observable<boolean>;
  public activeFolderName: string;
  public moveFileModalRef: any;
  public showMoveOption = false;
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

  public ngOnChanges(changes: SimpleChanges) {
    if ('folderList' in changes && this.activeFolderName) {
      if (this.activeFolderName !== 'myfiles') {
        this.folderList.splice( this.folderList.indexOf(this.activeFolderName), 1 );
        this.folderList.unshift('myfiles');
      }
    }
  }

  public ngOnInit() {

    // listen for params
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params && params['driveId']) {
        this.activeFolderName = params['driveId'];
      } else {
        this.activeFolderName = 'myfiles';
      }
    });

    // some action on urls
    this.uriUtils(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.uriUtils(this.router.routerState.snapshot);
      }
    });
  }

  public moveFile(item: IFileFormRes, template) {
    console.log(item);
    if (this.showMoveOption) {
      this.selectedItemToMove = item;
      this.moveFileModalRef = this.modalService.open(
        template,
        {
          windowClass: 'adminPrimary'
        }
      );
    }
  }

  public setActiveFolder(name) {
    this.destinationFolder = name;
  }

  public submitMoveFile() {
    if (this.destinationFolder && this.destinationFolder !== SELECT_OPT) {
      this.dismissMoveFileModal();
    }
  }

  public dismissMoveFileModal(reason?: string) {
    this.moveFileModalRef.close();
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
    }
  }

  public downloadFile(item: IFileFormRes) {
    this.uploadService.downloadFile(item.key, item.displayName);
  }

  public deleteFile(item: IFileFormRes) {
    if (item) {
      const modalRef = this.modalService.open(
        DeleteModalComponent,
        {
          windowClass: 'customWarning'
        }
      );
      modalRef.componentInstance.folderName = this.activeFolderName;
      modalRef.componentInstance.type = 'file';
      modalRef.componentInstance.item = item;
      modalRef.componentInstance.userId = this.userId;
    }
  }

  private uriUtils(r: RouterStateSnapshot) {
    this.showMoveOption = (r.url.includes('/admin/drive/external/')) ? true : false;
  }

}
