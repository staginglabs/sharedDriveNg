import { Injectable } from '@angular/core';
import { BaseResponse } from '../models';
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
}
