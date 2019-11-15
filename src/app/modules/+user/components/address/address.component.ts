import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { ReplaySubject, Observable, of } from 'rxjs';
import { BaseResponse, ICountries, IStates } from 'src/app/models';
import { LocalService } from 'src/app/services/local.service';
import { clone, isEmpty } from 'src/app/lodash.optimized';
import { EMAIL_REGEX } from 'src/app/app.constant';
import { takeUntil } from 'rxjs/operators';

@Component({
  styleUrls: ['./address.component.scss'],
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit, OnDestroy {
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
  ) {
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
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(p => {
      if (isEmpty(p)) {
        this.isEditMode = false;
      } else {
        this.handleQueryParamsChanges(p);
      }
    });

    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      if (d) {
        // console.log(d);
        // this.initPersonalForm(d);
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

  public allowOnlyNumbers(event, val: any): boolean {
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
    console.log('onSubmit');
    console.log(this.form.value);
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
    this.form = this.fb.group(this.initBillingForm());
    this.form.get('state').disable();
    this.form.get('city').disable();
    if (this.editType === 'billing') {
      this.form.get('first_name').setValidators([Validators.required]);
      this.form.get('last_name').setValidators([Validators.required]);
      this.form.get('company').setValidators([Validators.required]);
    }
    this.handleChanges();
  }

  private handleChanges() {
    this.form.valueChanges.subscribe(res => {
      console.log(this.form);
      console.log(res);
    });
  }

  private initBillingForm(): any {
    let optional = {
      first_name: [null],
      last_name: [null],
      company: [null],
    };
    let cond = {
      phone: [null,  [Validators.required]],
      email: [null,
        Validators.compose([
          Validators.required, Validators.pattern(EMAIL_REGEX)
        ])
      ]
    };
    let obj = {
      type: [this.editType],
      address_1: [null,  [Validators.required]],
      address_2: [null,  [Validators.required]],
      country: [null,  [Validators.required]],
      state: [null,  [Validators.required]],
      city: [null,  [Validators.required]],
      postcode: [null,  [Validators.required]]
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
    // this.editTypeHeading = (obj.type === 'billing') ? 'Billing' : 'Mailing';
    this.isEditMode = true;
  }
}
