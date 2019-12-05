import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './../../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import {
  USER_COMPONENTS,
  DashboardComponent,
  OrderComponent,
  AccountDetailsComponent,
  AddressComponent,
} from './components';
import { UserComponent } from './user.component';

const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders', component: OrderComponent },
      {
        path: 'shared-drive',
        loadChildren: './../+drive/drive.module#DriveModule'
      },
      { path: 'account-details', component: AccountDetailsComponent },
      { path: 'address', component: AddressComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    UserComponent,
    USER_COMPONENTS
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(USER_ROUTES)
  ],
  entryComponents: [
  ]
})
export class UserModule { }
