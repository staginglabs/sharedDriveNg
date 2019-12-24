import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions } from 'src/app/actions';
import { BaseResponse } from 'src/app/models';
import { ReplaySubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UploadService } from 'src/app/services/upload.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./create-drive-s3.component.scss'],
  templateUrl: './create-drive-s3.component.html'
})
export class CreateDriveS3Component implements OnInit, OnDestroy {
  public loading = false;
  public returnUrl: string;
  public email: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private uploadService: UploadService
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // http://localhost:3000/create-drive-s3?email=ssanchez.luiss@gmail.com&returnUrl=dashboard
    this.email = this.route.snapshot.queryParams['email'];
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.email) {
      this.verifyToken();
    } else {
      this.router.navigate(['/login']);
    }
  }

  private verifyToken() {
    this.uploadService.listFiles();
    // this.uploadService.createFolder(this.email)
    // .then(res => {
    //   this.router.navigate(['/login']);
    // })
    // .catch(err => {
    //   console.log(err);
    // });
  }

}
