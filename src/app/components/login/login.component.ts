import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions, UserActions } from 'src/app/actions';
import { ReplaySubject, combineLatest } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services';
import { BaseResponse, IMsgRes, IUserDetailsData } from 'src/app/models';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { clone, omit } from 'src/app/lodash.optimized';

@Component({
  styleUrls: ['./login.component.scss'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  public userDetails: any;
  public otpForm: FormGroup;
  public isOtpSent: boolean;
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public errMsg: string;
  private authDetailsUpdatedManually: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authActions: AuthActions,
    private userActions: UserActions,
    private authService: AuthService,
    private toast: ToastrService,
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    this.otpForm = this.formBuilder.group({
      mobile: ['', Validators.required],
      mobileClone: [''],
      otp: ['', Validators.required]
    });

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // listne
    this.store.pipe(select(p => p.auth.isOtpSent), takeUntil(this.destroyed$))
    .subscribe(res => {
      this.isOtpSent = res;
    });

    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), takeUntil(this.destroyed$))
    .subscribe(data => {
      if (data) {
        this.userDetails = data;
        if (!this.authDetailsUpdatedManually) {
          this.store.dispatch(this.userActions.getProfileReq());
        }
      }
    });

    // listen for updated user details
    this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    .subscribe(data => {
      if (data) {
        if (!this.isOtpSent) {
          if (!this.authDetailsUpdatedManually) {
            let obj: any = omit(data, ['billing', 'shipping']);
            this.authDetailsUpdatedManually = true;
            this.store.dispatch(this.authActions.updateUserAuthDetailsLocal(obj));
          }
          this.doLoginLogic(data);
        }
      }
    });

    // listen for token
    this.store.pipe(select(p => p.auth.loginErrMsg), takeUntil(this.destroyed$))
    .subscribe(err => {
      if (err) {
        this.errMsg = err;
        this.submitted = false;
        this.loading = false;
      }
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.goBack();
  }

  public onSubmit() {
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    this.submitted = true;
    this.loading = true;
    this.store.dispatch(this.authActions.signInReq(this.loginForm.value));
  }

  public numberOnly(event): boolean {
    const val = event.target.value;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 46 && val && val.length > 0 && !val.includes('.')) {
      return true;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  public sendOtp() {
    let data = this.otpForm.value;
    if (data && data.mobile) {
      this.authService.sendOtp(data)
      .then((res: BaseResponse<IMsgRes, any>) => {
        if (res.body && res.body.type === 'success') {
          this.store.dispatch(this.authActions.isOtpSent(true));
        } else {
          this.goBack();
        }
      })
      .catch((err: any) => {
        this.goBack();
      });
    }
  }

  public goBack() {
    this.store.dispatch(this.authActions.setOTPStatus(false));
    this.store.dispatch(this.authActions.isOtpSent(false));
  }

  public resendOtp() {
    this.sendOtp();
  }

  public verifyOtp() {
    let data = this.otpForm.value;
    if (data && data.mobile && data.otp) {
      // verify otp
      this.authService.verifyOtp(data)
      .then((res: BaseResponse<IMsgRes, any>) => {
        if (res.body && res.body.type === 'success') {
          this.store.dispatch(this.authActions.setOTPStatus(true));
          this.doRedirect();
        } else {
          this.store.dispatch(this.authActions.setOTPStatus(false));
          this.toast.error('Credenciales incorrectas', 'Error');
        }
      })
      .catch(console.log);
    }
  }

  private doRedirect() {
    if (this.userDetails.is_admin) {
      this.router.navigate(['/admin/shared-drive/drive/myfiles']);
    } else {
      this.router.navigate(['/user/dashboard']);
    }
  }

  private getMaskedNumber(mobile) {
    let total = mobile.length;
    let last = mobile.substring(total - 4, total);
    let newstr = '';
    let i;
    for (i = 0; i < total - 4; i++) {
      newstr += 'X';
    }
    return newstr + last;
  }

  private provideFakeLogin() {
    this.store.dispatch(this.authActions.isOtpSent(true));
    setTimeout(() => {
      console.log('setOTPStatus');
      this.store.dispatch(this.authActions.setOTPStatus(true));
    }, 300);
    setTimeout(() => {
      console.log(this.userDetails);
      this.doRedirect();
    }, 1000);
  }

  private doLoginLogic(data: IUserDetailsData) {
    console.log(data);
    return;
    if (data && data.billing_phone) {
      let numb = `+-*&*${clone(data.billing_phone)}`;
      let filtered = numb.replace(/[^0-9]/g, '');
      this.otpForm.get('mobile').patchValue(filtered);
      this.otpForm.get('mobileClone').patchValue(this.getMaskedNumber(filtered));
      if (!this.isOtpSent) {
        // uncomment while production
        this.sendOtp();
      }
      // uncomment while developement
      // this.provideFakeLogin();
    } else {
      this.toast.info('Su número de teléfono móvil no está registrado con nosotros, póngase en contacto con el administrador', 'Information', {disableTimeOut: true});
    }
  }
}
