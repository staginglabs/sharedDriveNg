import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions } from 'src/app/actions';
import { ITokenReq, BaseResponse } from 'src/app/models';
import { ReplaySubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./token-verify.component.scss'],
  templateUrl: './token-verify.component.html'
})
export class TokenVerifyComponent implements OnInit, OnDestroy {
  public loading = false;
  public returnUrl: string;
  public token: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authActions: AuthActions,
    private authService: AuthService,
    private toast: ToastrService,
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // http://localhost:3000/token-verify?token=lkajf93809438lajf09803&returnUrl=dashboard
    console.log( this.route.snapshot.queryParams);
    this.token = this.route.snapshot.queryParams['token'];
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.token) {
      this.verifyToken();
    }
  }

  public verifyToken() {
    let o: ITokenReq = {
      token: this.token
    };
    this.authService.verifyToken(o)
    .then((res: BaseResponse<any, ITokenReq>) => {
      // in case of wrong token provided
      if (res.body.status === 'error') {
        this.toast.error(`${res.body.message}`, 'Error');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      } else {
        // success scenerio
        console.log(res.body);
        // this.store.dispatch(this.authActions.setToken())
        this.router.navigate(['/dashboard']);
      }
    })
    .catch(err => {
      this.toast.error(``, 'Error');
      console.log('hey inside error');
      console.log(err);
    });
  }

}
