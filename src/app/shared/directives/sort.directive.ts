import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReplaySubject } from 'rxjs';

type SortColumn = keyof any | '';
type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { asc: 'desc', desc: '', '': 'asc' };

interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'th[sortable]',
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeaderDirective implements OnInit, OnDestroy {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
  }

  public rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}
