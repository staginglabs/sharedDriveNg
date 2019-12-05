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

@Component({
  styleUrls: ['./user-detail-view.component.scss'],
  templateUrl: './user-detail-view.component.html'
})
export class UserDetailViewComponent implements OnInit, OnDestroy {
  public modalRef: any;
  public activeUser: IUserList;
  public allUsers$: Observable<IUserList[]>;
  public foldersList$: Observable<string[]>;
  public filesList$: Observable<IFileFormRes[]>;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private modalService: NgbModal
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

  private findActiveUser(id: number) {
    this.allUsers$.pipe(take(3)).subscribe(res => {
      if (res && res.length) {
        this.activeUser = find(res, ['id', id]);
        console.log(this.activeUser);
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

}
