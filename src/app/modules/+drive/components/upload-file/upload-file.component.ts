import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil, take } from 'rxjs/operators';
import { IUserData, IFileForm, IS3UploadRes } from 'src/app/models';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services';
import { clone } from 'src/app/lodash.optimized';
import { MY_FILES } from 'src/app/app.constant';


@Component({
  selector: 'app-upload-file-button',
  styleUrls: ['./upload-file.component.scss'],
  templateUrl: './upload-file.component.html'
})
export class UploadFileComponent implements OnInit, OnDestroy {
  public activeFolderName: string;
  public drivePath: string;
  public uploadFileProgress: boolean;
  public uploadFileError: boolean;
  public uploadErrorMsg = 'Something went wrong!';
  public uploadFileSuccess: boolean;
  public form: FormGroup;
  public data: IUserData;
  public modalRef: any;
  public fileName: any;
  private fileObj: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private uploadService: UploadService,
    private userService: UserService,
    private userActions: UserActions
  ) {
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {
    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), take(1))
    .subscribe(d => {
      this.data = d;
    });
    // init form
    this.initForm();

    // listen for params and set active folder
    this.route.params.pipe(take(1))
    .subscribe(params => {
      if (params && params['driveId']) {
        this.activeFolderName = params['driveId'];
      } else {
        this.activeFolderName = MY_FILES;
      }
    });
  }

  public openDialog(template) {
    this.resetLoadState();
    this.getDrivePath();
    this.modalRef = this.modalService.open(template, { windowClass: 'customPrimary' });
  }

  public dismissModal(reason) {
    this.modalRef.close();
  }

  public triggerUploadFile(event: MouseEvent) {
    if (event) {
      this.fileObj = null;
      document.getElementById('fileInpt').click();
    }
  }

  public onfileInputChange(event: any) {
    this.uploadFileError = false;
    this.uploadErrorMsg = null;
    this.fileObj = event.srcElement.files[0];
  }

  public uploadFile() {
    if (this.form.valid && this.fileObj) {

      // getting file size in mb
      let size = this.fileObj.size / 1024 / 1024;
      if (size > 1) {
        this.uploadErrorMsg = 'File size limit exceeds. try again with file size less than 10mb';
        this.uploadFileError = true;
        return;
      }

      let obj: any = this.form.value;
      this.uploadFileProgress = true;
      this.fileName = this.fileObj.name.replace(/[^\w\s\.\_\-]/gi, '');
      obj.displayName = clone(this.fileName);
      this.fileName = `${new Date().getTime()}_${this.fileName}`;
      obj.file = this.fileObj;
      obj.key = `${this.drivePath}/${this.fileName}`;
      obj.name = this.fileName;
      // handle for zip and dmg and few other types
      obj.type = this.fileObj.type || `application/${this.fileName.split('.').pop()}`;
      this.doUploadFile(obj);
    }
  }

  private doUploadFile(obj: any) {
    this.uploadService.uploadfile(obj)
    .then((res: any) => {
      this.prepareApiData(obj, res);
    }).catch((err: any) => {
      this.resetLoadState();
      this.uploadFileError = true;
      this.uploadErrorMsg = err;
      console.log('[ERROR]', err);
    });
  }

  private resetLoadState() {
    this.uploadFileSuccess = false;
    this.uploadFileError = false;
    this.uploadFileProgress = false;
  }

  private hitApi(obj) {
    this.userService.insertFileEntry(obj)
    .then(result => {
      this.getS3Files();
      this.uploadFileError = false;
      this.uploadFileProgress = false;
      this.uploadFileSuccess = true;
      // reset form
      this.initForm();
    })
    .catch(err => {
      console.log(err);
    });
  }

  private prepareApiData(obj: IFileForm, res: IS3UploadRes) {
    obj.id = new Date().getTime();
    obj.lastModified = obj.id;
    obj.key = res.Key;
    obj.location = res.Location;
    obj.isDeleted = false;
    obj.uploadedBy = this.findUploader();
    obj.folderName = this.activeFolderName;
    this.hitApi(obj);
  }

  private findUploader(): 'user' | 'admin' {
    if (this.activeFolderName === MY_FILES) {
      return (this.data && this.data.is_admin) ? 'admin' : 'user';
    } else {
      return 'admin';
    }
  }

  private initForm() {
    this.form = this.fb.group({
      email: [this.data.user_email, Validators.required],
      note: [null],
      file: [null, Validators.required]
    });
  }

  private getDrivePath() {
    this.drivePath = `${this.data.user_email}/${this.activeFolderName}`;
  }

  private getS3Files() {
    // initiate get files req and reset after a delay
    this.store.dispatch(this.userActions.triggerFileReq(true));
    setTimeout(() => {
      this.store.dispatch(this.userActions.triggerFileReq(true));
    }, 5000);
  }

}
