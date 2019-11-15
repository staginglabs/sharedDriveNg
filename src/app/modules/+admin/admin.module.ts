import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin.component';
import {
  ADMIN_COMPONENTS,
  AdminDriveDetailsComponent,
  AdminDashboardComponent,
} from './components';


const USER_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'drive/:driveId',
        component: AdminDriveDetailsComponent,
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          // { path: 'user/:userId', component: AccountDetailsComponent },
          // { path: '**', redirectTo: '', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AdminComponent,
    ADMIN_COMPONENTS
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(USER_ROUTES)
  ]
})
export class AdminModule { }
