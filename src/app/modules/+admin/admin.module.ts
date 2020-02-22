import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin.component';
import {
  ADMIN_COMPONENTS,
  AdminDriveDetailsComponent,
  AdminDashboardComponent,
  UserDriveDetailComponent,
  UserParentComponent,
} from './components';
import { DriveDetailsComponent } from '../+drive/components/drive-details';


const USER_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'drive/internal',
        // loadChildren: './../+drive/drive.module#DriveModule'
      },
      {
        path: 'drive/external',
        component: AdminDriveDetailsComponent,
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          {
            path: 'user/:userId',
            component: UserParentComponent,
            children: [
              { path: '', component: UserDriveDetailComponent },
              { path: ':driveId', component: UserDriveDetailComponent },
              { path: ':driveId/:DC', component: UserDriveDetailComponent },
              { path: ':driveId/:DC/:GC', component: UserDriveDetailComponent },
              { path: ':driveId/:DC/:GC/:GGC', component: UserDriveDetailComponent },
              { path: ':driveId/:DC/:GC/:GGC/:GGGC', component: UserDriveDetailComponent },
              { path: '**', redirectTo: '', pathMatch: 'full' }
            ]
          },
          { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'drive/internal', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AdminComponent,
    ADMIN_COMPONENTS
  ],
  exports: [
    ADMIN_COMPONENTS
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(USER_ROUTES)
  ]
})
export class AdminModule { }
