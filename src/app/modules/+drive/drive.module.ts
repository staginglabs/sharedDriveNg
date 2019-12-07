import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from './../../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

import {
  SharedDriveComponent,
  DriveDetailsComponent
} from './components';

const USER_ROUTES: Routes = [
  {
    path: '',
    component: SharedDriveComponent,
    children: [
      { path: 'drive/:driveId', component: DriveDetailsComponent },
      { path: '**', redirectTo: '', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(USER_ROUTES)
  ],
  exports: [
  ],
  entryComponents: [
  ]
})
export class DriveModule { }
