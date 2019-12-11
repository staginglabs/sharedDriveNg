import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { AuthActions, UserActions } from 'src/app/actions';
import { ISignInRequest } from 'src/app/models';
import { ReplaySubject } from 'rxjs';

@Component({
  styleUrls: ['./login.component.scss'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public errMsg: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authActions: AuthActions,
    private userActions: UserActions
  ) {

    // listen for token and user details
    this.store.pipe(select(p => p.auth), takeUntil(this.destroyed$))
    .subscribe(state => {
      if (state.token && state.details) {
        this.store.dispatch(this.userActions.getProfileReq());
        if (state.details.is_admin) {
          this.router.navigate(['/admin/shared-drive/drive/myfiles']);
        } else {
          this.router.navigate(['/user/dashboard']);
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
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
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
}
