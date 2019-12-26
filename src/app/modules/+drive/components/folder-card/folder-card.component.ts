import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from 'src/app/components/delete-modal';
import { NotesModalComponent } from '../notes-modal';

@Component({
  selector: 'app-folder-card',
  styleUrls: ['./folder-card.component.scss'],
  templateUrl: './folder-card.component.html'
})
export class FolderCardComponent implements OnInit, OnDestroy {
  @Input() public item: any;
  @Input() public key: string;
  @Input() public id: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private modalService: NgbModal,
  ) {
  }


  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    //
  }

  public showDriveInfo(item: any) {
    if (item) {
      let o: any = {};
      o.displayName = this.translate.instant('cmn.driveInfo');
      o.note = item.description;
      const modalRef = this.modalService.open(
        NotesModalComponent,
        {
          windowClass: 'customPrimary'
        }
      );
      modalRef.componentInstance.item = o;
    }
  }

  public deleteFolder(item: any) {
    let key = `${this.key}/${item.name}/`;
    const modalRef = this.modalService.open(
      DeleteModalComponent,
      {
        windowClass: 'customWarning'
      }
    );
    modalRef.componentInstance.folderName = key;
    modalRef.componentInstance.type = 'folder';
    modalRef.componentInstance.displayName = item.name;
    modalRef.componentInstance.userId = this.id;
  }

}
