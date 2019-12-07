import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { IS3FilesReq, IFileFormRes } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UploadService } from 'src/app/services/upload.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  styleUrls: ['./drive-details.component.scss'],
  templateUrl: './drive-details.component.html'
})
export class DriveDetailsComponent implements OnInit, OnDestroy {
  public showBreadCrumb = true;
  public activeFolderName: string;
  public filesList$: Observable<IFileFormRes[]>;
  public searchString: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private uploadService: UploadService,
    private modalService: NgbModal,
    private location: Location
  ) {
    // listen for user files
    this.filesList$ = this.store.pipe(select(p => p.user.files), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

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

    this.uriUtils(this.router.routerState.snapshot);
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.uriUtils(this.router.routerState.snapshot);
      }
    });
  }

  public goBack(e: any) {
    if (e) {
      this.location.back();
    }
  }

  private uriUtils(r: RouterStateSnapshot) {
    if (r.url.includes('/admin/shared-drive')) {
      this.showBreadCrumb = false;
    } else {
      this.showBreadCrumb = true;
    }
  }

  private getS3Files() {
    let obj: IS3FilesReq = {
      folderName: this.activeFolderName,
      userId: '1'
    };
    this.store.dispatch(this.userActions.getFilesReq(obj));
  }

}
