import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable, of, combineLatest } from 'rxjs';
import { BaseResponse, ICountries, IStates, IUserDetailsData } from 'src/app/models';
import { LocalService } from 'src/app/services/local.service';
import { clone, isEmpty } from 'src/app/lodash.optimized';
import { EMAIL_REGEX } from 'src/app/app.constant';
import { takeUntil } from 'rxjs/operators';
import { UserActions } from 'src/app/actions';

@Component({
  styleUrls: ['./address.component.scss'],
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit, OnDestroy {
  public updateProfileProgress$: Observable<boolean>;
  public userData: IUserDetailsData;
  public isEditMode = false;
  public editType: string;
  public countries: ICountries[] = [];
  public filteredCountries$: Observable<any[]>;
  public states: IStates[] = [];
  public filteredStates$: Observable<IStates[]>;
  public form: FormGroup;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localService: LocalService,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private userActions: UserActions,
  ) {
    this.updateProfileProgress$ = this.store.pipe(select(p => p.user.updateProfileProgress), takeUntil(this.destroyed$));
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen on countries
    this.localService.getCountries().then(res => {
      this.countries = res.body.countries;
    });

    // listen for query params changes
    // listen for user details
    combineLatest([
      this.route.queryParams.pipe(takeUntil(this.destroyed$)),
      this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    ])
    .subscribe((arr: any[]) => {
      if (arr[0] && arr[1]) {
        this.userData = arr[1];
        const p = arr[0];
        if (isEmpty(p)) {
          this.isEditMode = false;
        } else {
          this.handleQueryParamsChanges(p);
        }
      }
    });
  }

  public customSearchFn(term: string, item: ICountries) {
    term = term.toLowerCase();
    let numTerm = clone(+term);
    return item.name.toLowerCase().indexOf(term) > -1 || item.phoneCode === numTerm;
  }

  public setEditMode(type) {
    let queryParams = {
      editMode: true,
      type
    };
    this.router.navigate( [],
    {
      relativeTo: this.route,
      queryParams,
    });
  }

  public resetEditMode() {
    let queryParams = null;
    this.router.navigate( [],
    {
      relativeTo: this.route,
      queryParams,
    });
  }

  public allowOnlyNumbers(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    if (charCode === 46) {
      return false;
    }
    return true;
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(this.userActions.updateProfileReq(this.form.value));
    }
  }

  public handleCountrySelection(e: ICountries) {
    this.filteredStates$ = of([]);
    const s: AbstractControl = this.form.get('state');
    const c: AbstractControl = this.form.get('city');
    this.resetFormControl(s);
    this.resetFormControl(c);
    if (e) {
      this.getStates(e.name);
    } else {
      s.disable();
      c.disable();
    }
  }

  public handleStateSelection(e: any) {
    const c: AbstractControl = this.form.get('city');
    this.resetFormControl(c);
    if (e) {
      c.enable();
    } else {
      c.disable();
    }
  }

  public getItemClass(key: string, form: any) {
    if (key && form) {
      const c: AbstractControl = form.get(key);
      if (c && c.errors && c.errors.required) {
        return true;
      }
      return false;
    }
    return false;
  }

  private resetFormControl(a: AbstractControl) {
    a.setValue(null);
    a.markAsDirty();
    a.markAsTouched();
  }

  private getStates(name: string) {
    const item: ICountries = this.countries.find(i => i.name === name);
    if (item) {
      this.localService.getStates(item.id.toString()).then((res: IStates[]) => {
        this.states = res;
        setTimeout(() => {
          this.filteredStates$ = of(res);
          this.form.get('state').enable();
        }, 100);
      });
    }
  }

  private initForm(): void {
    this.form = this.fb.group(this.initCondForm());
    // conditional disabled fields
    if (this.form.get('country').status !== 'VALID') {
      this.form.get('state').disable();
    }
    if (this.form.get('state').status !== 'VALID') {
      this.form.get('city').disable();
    }
    if (this.editType === 'billing') {
      this.form.get('first_name').setValidators([Validators.required]);
      this.form.get('last_name').setValidators([Validators.required]);
      this.form.get('company').setValidators([Validators.required]);
    }
  }

  // private handleChanges() {
  //   this.form.valueChanges.subscribe(res => {
  //   });
  // }

  private initCondForm(): any {
    let o = this.userData[this.editType];
    let optional = {
      first_name: [o[`${this.editType}_first_name`]],
      last_name: [o[`${this.editType}_last_name`]],
      company: [o[`${this.editType}_company`]],
    };
    let cond = {
      phone: [o[`${this.editType}_phone`],  [Validators.required]],
      email: [o[`${this.editType}_email`],
        Validators.compose([
          Validators.required, Validators.pattern(EMAIL_REGEX)
        ])
      ]
    };
    let obj = {
      update_type: [this.editType],
      address_1: [o[`${this.editType}_address_1`],  [Validators.required]],
      address_2: [o[`${this.editType}_address_2`],  [Validators.required]],
      country: [o[`${this.editType}_country`],  [Validators.required]],
      state: [o[`${this.editType}_state`],  [Validators.required]],
      city: [o[`${this.editType}_city`],  [Validators.required]],
      postcode: [o[`${this.editType}_postcode`],  [Validators.required]]
    };
    if (this.editType === 'billing') {
      return {...obj, ...optional, ...cond};
    }
    return {...obj, ...optional};
  }

  private handleQueryParamsChanges(obj: any) {
    this.editType = obj.type;
    // init form
    this.initForm();
    this.isEditMode = true;
  }
}
