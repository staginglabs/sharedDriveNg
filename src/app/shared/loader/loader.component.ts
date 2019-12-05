import { Component, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-loader-small',
  templateUrl: 'loader.component.html'
})
export class LoaderComponent implements OnDestroy {

  @Input() public status: boolean;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() { }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
