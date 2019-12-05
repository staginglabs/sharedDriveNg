import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { IUserList } from 'src/app/models';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-card',
  styleUrls: ['./user-card.component.scss'],
  templateUrl: './user-card.component.html'
})
export class UserCardComponent implements OnInit, OnDestroy {

  @Input() public driveId: number;
  @Input() public user: IUserList;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    public router: Router,
    private route: ActivatedRoute,
  ) {}

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
  }

  public deleteUser(item) {
    console.log('deleteUser');
    console.log(item);
  }

  public viewUser(item) {
    // console.log('viewUser');
    console.log(item);
    console.log(this.driveId);
    this.router.navigate(['admin', 'drive', this.driveId, 'user', item.id]);
  }

}
