import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject } from 'rxjs';
import { UserService } from 'src/app/services';
import { takeUntil } from 'rxjs/operators';
import { IS3FilesReq, BaseResponse, IFileFormRes } from 'src/app/models';

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
    private userService: UserService
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen for user details
    this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      console.log(d);
    });

    // listen for params
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      console.log(params);
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

  private getS3Files() {
    let obj: IS3FilesReq = {
      folderName: this.activeFolderName
    };
    this.userService.getS3Files(obj)
    .then((res: BaseResponse<IFileFormRes[], any>) => {
      this.fileList = res.body;
      console.log(this.fileList);
    })
    .catch(err => {
      console.log(err);
    });
    // this.store.dispatch()
  }

}
