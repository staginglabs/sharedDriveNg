import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  styleUrls: ['./notes-modal.component.scss'],
  templateUrl: './notes-modal.component.html'
})
export class NotesModalComponent implements OnInit, OnDestroy {
  @Input() public item: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    public modal: NgbActiveModal
  ) {}


  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    //
  }

  public closeModal(reason: string) {
    this.modal.close(reason);
  }

}
