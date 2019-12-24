import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IUserDetailsData, IChangePasswordReq, BaseResponse, ISuccessRes } from 'src/app/models';
import { UserActions } from 'src/app/actions';
import { UserService } from 'src/app/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./account-details.component.scss'],
  templateUrl: './account-details.component.html'
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
  public accountDetailsInProgress = false;
  public changePasswordInProgress = false;
  public personalForm: FormGroup;
  public changePasswordForm: FormGroup;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private userActions: UserActions,
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
      if (d) {
        this.initPersonalForm(d);
      }
    });

    // init form
    this.initForm();
  }

  public onSubmitAccountDetails(): void {
    if (this.personalForm.valid) {
      this.store.dispatch(this.userActions.updateProfileReq(this.personalForm.value));
    }
  }

  public onSubmitChangePassword() {
    // if form is invalid
    if (this.changePasswordForm.valid) {
      let o = this.changePasswordForm.value.passwords;
      let d: IChangePasswordReq = {
        newpassword: o.password_1,
        ccpassword: o.password_2
      };
      this.userService.changePassword(d)
      .then((res: BaseResponse<ISuccessRes, IChangePasswordReq>) => {
        console.log(res);
      })
      .catch((err: BaseResponse<ISuccessRes, IChangePasswordReq>) => {
        console.log(err);
      });
    }
  }

  private initForm() {
    // change password
    this.changePasswordForm = this.fb.group({
      password_current: [null, [Validators.required]],
      passwords: this.fb.group({
        password_1: ['', [Validators.required]],
        password_2: ['', [Validators.required]],
      }, {validator: this.passwordConfirming}),
    });
  }

  private passwordConfirming(c: AbstractControl): { invalid: boolean } {
    if (c.get('password_1').value !== c.get('password_2').value) {
      return {invalid: true};
    }
  }

  private initPersonalForm(o: IUserDetailsData) {
    // personal form
    this.personalForm = this.fb.group({
      update_type: ['personal'],
      first_name: [o.first_name, [Validators.required]],
      last_name: [o.last_name, [Validators.required]],
      company_name: [o.company_name, [Validators.required]],
      email: [o.user_email]
    });
    this.personalForm.get('email').disable();
  }

}
