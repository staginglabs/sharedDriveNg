import { Injectable } from '@angular/core';
import { BaseResponse, ICreateFolderDetails } from '../models';
import { HttpWrapperService } from './http-wrapper.service';

@Injectable({
  providedIn: 'root',
})
export class LocalService {

  constructor(
    private http: HttpWrapperService
  ) { }

  public getCountries(): Promise<BaseResponse<any, any>> {
    let url = 'https://consult.tax/clientes/assets/db/countries.json';
    return this.http.get(url);
  }

  public getStates(countryId: string): Promise<any[]> {
    let url = 'https://consult.tax/clientes/assets/db/states.json';
    return this.http.get(url).then(res => {
      return res.body.states.filter(i => i.country_id === countryId);
    });
  }

  public findItemRecursively(a: ICreateFolderDetails[], id: string): any {
    if (a) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < a.length; i++) {
        if (a[i].id === id) {
          return a[i];
        }
        const found = this.findItemRecursively(a[i].childrens, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  public getNameOfFolder(id, arr: ICreateFolderDetails[]): string {
    if (arr && arr.length === 0) {
      return `Mis archivos`;
    } else {
      const data = this.findItemRecursively(arr, id);
      return (data && data.name) ? data.name : 'Mis archivos';
    }
  }
}
