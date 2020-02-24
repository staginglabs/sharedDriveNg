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
import { omit } from 'src/app/lodash.optimized';

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
    // http://localhost:3000/#/token-verify?token=lkajf93809438lajf09803&returnUrl=dashboard
    // https://consult.tax/clientes/#/token-verify?token=lkajf93809438lajf09803
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
      if (res && res.body && res.body.status === 'success') {
        this.dotheMagic(res.body.data);
      } else {
        this.toast.error(`${res.body.message}`, 'Error');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      }
    })
    .catch(err => {
      this.toast.error(`something went wrong`, 'Error');
      console.log(err);
    });
  }

  private dotheMagic(obj: any) {
    let o = {
      token: obj.token,
      details: omit(obj, ['token'])
    };
    this.store.dispatch(this.authActions.setTokenResponse(o));
    this.store.dispatch(this.authActions.setOTPStatus(true));
    this.store.dispatch(this.authActions.isOtpSent(true));
    setTimeout(() => {
      this.doRedirect(o);
    }, 1000);
  }

  private doRedirect(o: any) {
    if (o && o.details && o.details.is_admin) {
      this.router.navigate(['/admin/shared-drive/myfiles']);
    } else {
      this.router.navigate(['/user/dashboard']);
    }
  }
}
