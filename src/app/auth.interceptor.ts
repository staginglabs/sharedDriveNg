import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {tap} from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  public headers: HttpHeaders;

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // append headers
    this.headers = new HttpHeaders();
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('Access-Control-Allow-Origin', '*');
    this.headers.set('Access-Control-Allow-Headers', 'Origin, Authorization, Content-Type, Accept');

    request = request.clone({
      headers: this.headers
    });
    // add authorization header with token if available
    let obj = JSON.parse(localStorage.getItem('auth'));
    if (obj.token && obj.details) {
      request = request.clone({
        setHeaders: {
          Authorization: obj.token
        }
      });
    }
    return next.handle(request).pipe( tap(() => {},
      (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
          return;
        }
        // clean localstorage to prevent infinite loop
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }));
  }
}
