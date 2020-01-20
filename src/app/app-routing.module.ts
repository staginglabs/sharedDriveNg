import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, AdminGuard, OtpGuard } from './guards';
// import components
import {
  LoginComponent,
  DummyComponent,
  TokenVerifyComponent,
  CreateDriveS3Component
} from './components';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard, OtpGuard],
    loadChildren: './modules/+admin/admin.module#AdminModule'
  },
  {
    path: 'user',
    canActivate: [AuthGuard, OtpGuard],
    loadChildren: './modules/+user/user.module#UserModule'
  },
  { path: 'home', component: DummyComponent },
  { path: 'token-verify', component: TokenVerifyComponent },
  { path: 'create-drive-s3', component: CreateDriveS3Component },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
