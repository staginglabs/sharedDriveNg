import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {

  constructor(public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let obj = JSON.parse(localStorage.getItem('auth'));
    if (obj.token && obj.details && obj.details.is_admin) {
      return true;
    }
    // not logged in so redirect
    this.router.navigate(['/user/dashboard']);
    return false;
  }
}
