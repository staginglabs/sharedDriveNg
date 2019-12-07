import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin.component';
import {
  ADMIN_COMPONENTS,
  AdminDriveDetailsComponent,
  AdminDashboardComponent,
  UserDetailViewComponent,
} from './components';
import { DriveDetailsComponent } from '../+drive/components/drive-details';


const USER_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'shared-drive',
        loadChildren: './../+drive/drive.module#DriveModule'
      },
      {
        path: 'drive/external',
        component: AdminDriveDetailsComponent,
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'user/:userId', component: UserDetailViewComponent },
          { path: 'user/:userId/drive/:driveId', component: DriveDetailsComponent },
          { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
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
