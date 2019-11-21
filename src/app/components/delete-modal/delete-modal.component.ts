import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IFileFormRes } from 'src/app/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  styleUrls: ['./delete-modal.component.scss'],
  templateUrl: './delete-modal.component.html'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @Input() public type: string;
  @Input() public item: IFileFormRes;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public modal: NgbActiveModal
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    console.log('hello from DeleteModalComponent');
  }

  public closeModal(reason: string) {
    this.modal.close(reason);
  }

  public performDelete() {
    console.log('performDelete');
    this.modal.close({action: this.type, msg: 'Bingo'});
  }

}
