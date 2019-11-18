import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { IUserData, IOrderRes } from 'src/app/models';

@Component({
  styleUrls: ['./order.component.scss'],
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit, OnDestroy {
  public activateOrderDetailsView: boolean;
  public loading = true;
  public orders: IOrderRes[];
  public selectedOrder: IOrderRes;
  public data: IUserData;
  private token: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private userActions: UserActions,
    private modalService: NgbModal
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // listen for token and user details
    this.store.pipe(select(p => p.auth.token), takeUntil(this.destroyed$))
    .subscribe(token => {
      this.token = token;
      if (this.token) {
        this.getOrders();
      }
    });
    this.store.pipe(select(p => p.auth.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      this.data = d;
    });

    // listen for orders
    this.store.pipe(select(p => p.user.orders), takeUntil(this.destroyed$))
    .subscribe(d => {
      if (d) {
        this.orders = d;
        this.loading = false;
      }
    });
  }

  public showOrderDetails(item: IOrderRes) {
    this.activateOrderDetailsView = true;
    this.selectedOrder = item;
  }

  public resetSeletedOrder() {
    this.activateOrderDetailsView = false;
    this.selectedOrder = null;
  }

  private getOrders() {
    this.loading = true;
    this.store.dispatch(this.userActions.getUserOrdersReq(this.token));
  }

  public open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then();
  }

}
