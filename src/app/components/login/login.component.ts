import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions, UserActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services';
import { BaseResponse, IMsgRes } from 'src/app/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  styleUrls: ['./login.component.scss'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  public userDetails: any;
  public otpForm: FormGroup;
  public isOtpSent = false;
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public errMsg: string;
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

    // listen for token and user details
    this.store.pipe(select(p => p.auth), takeUntil(this.destroyed$))
    .subscribe(state => {
      if (state.token && state.details) {
        this.userDetails = state.details;
        this.store.dispatch(this.userActions.getProfileReq());
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
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    this.otpForm = this.formBuilder.group({
      mobile: ['', Validators.required],
      otp: ['', Validators.required]
    });

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
          this.isOtpSent = true;
        }
      })
      .catch(console.log);
    }
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
          this.doRedirect();
        } else {
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
}
