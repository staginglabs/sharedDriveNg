import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'myUniversalPipeFunction',
  pure: true
})
// return the value of the function passed as parameter when pipe is used
export class UniversalPipeFunction implements PipeTransform {
  public transform(value: any, handler: (value: any, args?: any) => any, args?: any): any {
    return handler(value, args);
  }
}
