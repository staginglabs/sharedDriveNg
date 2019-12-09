import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IUserList } from 'src/app/models';
import { Router, ActivatedRoute } from '@angular/router';
import { DeleteModalComponent } from 'src/app/components/delete-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-card',
  styleUrls: ['./user-card.component.scss'],
  templateUrl: './user-card.component.html'
})
export class UserCardComponent implements OnInit, OnDestroy {

  @Input() public user: IUserList;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    public router: Router,
    private modalService: NgbModal,
    private route: ActivatedRoute,
  ) {}

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    //
  }

  public deleteUser(item) {
    let key = `${item.email}/`;
    const modalRef = this.modalService.open(
      DeleteModalComponent,
      {
        windowClass: 'customWarning'
      }
    );
    modalRef.componentInstance.folderName = key;
    modalRef.componentInstance.type = 'user';
    modalRef.componentInstance.item = item;
    modalRef.componentInstance.displayName = item.displayName;
    modalRef.result.then((res: any) => {
    }).catch(err => {
      console.log(err);
    });
  }

  public viewUser(item) {
    this.router.navigate(['admin', 'drive', 'external', 'user', item.id]);
  }

}
