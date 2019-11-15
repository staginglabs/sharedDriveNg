import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IUserData } from 'src/app/models';

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
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private fb: FormBuilder
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      if (d) {
        this.initPersonalForm(d);
      }
    });

    // init form
    this.initForm();
  }

  public onSubmitAccountDetails(): void {
    console.log(this.personalForm.value);
  }

  public onSubmitChangePassword() {
    console.log(this.changePasswordForm.value);
    // stop here if form is invalid
    // if (this.changePasswordForm.invalid) {
    //   return;
    // }
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

  private initPersonalForm(o: IUserData) {
    // personal form
    this.personalForm = this.fb.group({
      type: ['billing'],
      first_name: [o.first_name, [Validators.required]],
      last_name: [o.last_name, [Validators.required]],
      company_name: [o.company_name, [Validators.required]],
      email: [o.user_email]
    });
    this.personalForm.get('email').disable();
  }

}
