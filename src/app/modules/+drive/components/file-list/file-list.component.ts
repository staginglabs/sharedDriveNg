import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { IFileFormRes, IUserList, IFileForm, ICreateFolderDetails } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotesModalComponent } from '../notes-modal';
import { DeleteModalComponent } from 'src/app/components/delete-modal';
import { clone, last, cloneDeep, flatten, map, union, omit, remove } from 'src/app/lodash.optimized';
import { UserService } from 'src/app/services';
import { TranslateService } from '@ngx-translate/core';
import { MY_FILES } from 'src/app/app.constant';
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
  @Input() public folderList: ICreateFolderDetails[];
  @Input() public activeUser: IUserList;
  @Input() public hasPower = true;
  public errandInProgress: boolean;
  public destinationFolder = SELECT_OPT;
  public selectedItemToMove: IFileFormRes;
  public gettingfileInProgress$: Observable<boolean>;
  public activeFolderName: string;
  public moveFileModalRef: any;
  public showMoveOption = false;
  public moveToData: any = null;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private uploadService: UploadService,
    private modalService: NgbModal,
    private userService: UserService,
  ) {
    this.gettingfileInProgress$ = this.store.pipe(select(p => p.user.gettingfileInProgress), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnChanges(changes: SimpleChanges) {
    // if ('folderList' in changes && this.activeFolderName) {
    // }
  }

  public ngOnInit() {

    // listen on folders
    this.store.pipe(select(p => p.user.folders), takeUntil(this.destroyed$))
    .subscribe(res => {
      if (res && res.length) {
        this.prepareList(cloneDeep(res));
      }
    });

    // listen for params
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params && !params['userId']) {
        let o: string = last(Object.values(params));
        this.activeFolderName = o;
      } else {
        this.activeFolderName = MY_FILES;
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

  public customSearchFn(term: string, item: ICreateFolderDetails) {
    term = term.toLowerCase();
    const str: string = item.details.map(i => i.name).join(', ');
    if (item.name.toLowerCase().startsWith(term) ) {
      return item;
    } else {
      if (str.includes(term)) {
        return item;
      }
    }
  }

  public updateMoveUI(e: any) {
    if (e) {
      // this.destinationFolder = this.moveToData;
    }
  }

  public moveFile(item: IFileFormRes, template) {
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

  private fileErrands(data: any, newKey, oldKey) {
    let obj = {
      id: data.id,
      folderName: this.activeFolderName,
      userId: this.activeUser.id
    };
    data.folderName = this.destinationFolder;
    data.key = newKey;
    data.userId = this.activeUser.id;
    Promise.all([
      this.userService.deleteUsersS3Files(obj),
      this.userService.insertFileEntry(data)
    ])
    .then((res: any) => {
      this.errandInProgress = false;
      this.dismissMoveFileModal();
      // initiate get files req and reset after a delay
      this.store.dispatch(this.userActions.triggerFileReq(true));
      setTimeout(() => {
        this.store.dispatch(this.userActions.triggerFileReq(false));
      }, 1000);
      this.uploadService.deleteS3Object(oldKey);
    })
    .catch(err => {
      this.errandInProgress = false;
    });
  }

  private moveFileFromS3() {
    const oldKey: string = clone(this.selectedItemToMove.key);
    const newKey = `${this.activeUser.email}/${this.destinationFolder}/${this.selectedItemToMove.name}`;
    this.uploadService.copyS3Object(oldKey, newKey)
    .then(res => {
      this.fileErrands(this.selectedItemToMove, newKey, oldKey);
    })
    .catch(console.log);
  }

  public setActiveFolder(name) {
    this.destinationFolder = name;
  }

  public submitMoveFile() {
    if (this.destinationFolder && this.destinationFolder !== SELECT_OPT) {
      this.errandInProgress = true;
      this.moveFileFromS3();
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

  private flatten(ary) {
    return ary.reduce((a, b) => {
      if (b && b.childrens && b.childrens.length) {
        return a.concat(this.flatten(b.childrens));
      }
      return a.concat(b);
    }, []);
  }

  private async prepareList(arr) {
    this.folderList = await this.prepareListFlatten(arr, []);
    if (this.activeFolderName !== 'myfiles') {
      remove(this.folderList, i => i.id === this.activeFolderName);
    }
  }

  private prepareListFlatten(rawList: ICreateFolderDetails[], parent): any[] {
    let listofUN;
    listofUN = map(rawList, (listItem: ICreateFolderDetails) => {
      let newParents;
      let result;
      newParents = union([], parent);
      newParents.push({
        name: listItem.name,
        uniqueName: listItem.id
      });
      listItem.details = newParents;
      if (listItem.childrens && listItem.childrens.length > 0) {
        result = this.prepareListFlatten(listItem.childrens, newParents);
        result.push(omit(listItem, 'childrens'));
      } else {
        result = omit(listItem, 'childrens');
      }
      return result;
    });
    return flatten(listofUN);
  }

}
