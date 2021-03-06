import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OtpGuard implements CanActivate {

  constructor(public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let obj = JSON.parse(localStorage.getItem('auth'));
    if (obj.token && obj.details && obj.isOtpVerified) {
      return true;
    }
    // not logged in so redirect
    this.router.navigate(['/login']);
    return false;
  }
}
