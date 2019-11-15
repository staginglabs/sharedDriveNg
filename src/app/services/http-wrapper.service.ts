import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowRefService } from './window.service';

@Injectable({
  providedIn: 'root',
})
export class HttpWrapperService {

  constructor(
    // tslint:disable-next-line: variable-name
    private http: HttpClient,
    private winRef: WindowRefService
  ) { }

  public get = (url: string, params?: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options);
    options.params = params;
    return this.http.get(url, options).toPromise();
  }
  public post = (url: string, body: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options);
    return this.http.post(url, body, options).toPromise();
  }
  public put = (url: string, body: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options);
    return this.http.put(url, body, options).toPromise();
  }
  public delete = (url: string, params?: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options);
    options.search = this.objectToParams(params);
    return this.http.delete(url, options).toPromise();
  }
  public patch = (url: string, body: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options);
    return this.http.patch(url, body, options).toPromise();
  }

  private prepareOptions(options: any): any {
    options = options || {};

    if (!options.headers) {
      options.headers = {} as any;
    }

    if (!options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json';
    }
    // options.headers['Referrer-Policy'] = 'origin';
    // options.headers['access-control-allow-origin'] = '*';

    // const authToken = this.winRef.nativeWindow.localStorage.getItem('feathers-jwt');

    // if (!options.headers['Authorization'] && authToken) {
    //   options.headers['Authorization'] = authToken;
    // }

    options.headers = new HttpHeaders(options.headers);

    if (!options.observe) {
      options.observe = 'response';
    }
    options.responseType = 'json';
    return options;
  }

  private isPrimitive(value) {
    return value == null || (typeof value !== 'function' && typeof value !== 'object');
  }

  private objectToParams(object = {}) {
    return Object.keys(object).map(value => {
      let objectValue = this.isPrimitive(object[value]) ? object[value] : JSON.stringify(object[value]);
      return `${value}=${objectValue}`;
    }).join('&');
  }
}
