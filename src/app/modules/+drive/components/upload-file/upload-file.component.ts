import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil, take, filter } from 'rxjs/operators';
import { IUserData, IFileForm, IS3UploadRes, IUserList, IUserDetailsData } from 'src/app/models';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services';
import { clone, find, last } from 'src/app/lodash.optimized';
import { MY_FILES } from 'src/app/app.constant';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-upload-file-button',
  styleUrls: ['./upload-file.component.scss'],
  templateUrl: './upload-file.component.html'
})
export class UploadFileComponent implements OnInit, OnDestroy {
  @Input() public uploadPath: string;
  public uploadMsg: string;
  public activeFolderName: string;
  public drivePath: string;
  public uploadFileProgress: boolean;
  public uploadFileError: boolean;
  public uploadErrorMsg: string;
  public uploadFileSuccess: boolean;
  public form: FormGroup;
  public data: IUserData;
  public userData: IUserDetailsData;
  public modalRef: any;
  public fileName: any;
  public activeUser: IUserList;
  public allUsers$: Observable<IUserList[]>;
  private fileObj: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private uploadService: UploadService,
    private userService: UserService,
    private userActions: UserActions
  ) {
    this.allUsers$ = this.store.pipe(select(p => p.user.allUsers), takeUntil(this.destroyed$));
    this.setErrMsg('Something went wrong!');
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public ngOnInit() {

    // listen for params
    // listen for params and find active user
    this.route.params.pipe(takeUntil(this.destroyed$))
    .subscribe(params => {
      if (params && params['userId']) {
        this.findActiveUser(+params['userId']);
      }
    });

    // listen for token and user details
    this.store.pipe(select(p => p.user.details), takeUntil(this.destroyed$))
    .subscribe(d => {
      this.userData = d;
      // init form
      if (d) {
        this.initForm();
      }
    });

    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), take(1))
    .subscribe(d => {
      this.data = d;
    });

    // listen for params and set active folder
    this.route.firstChild.params.pipe(take(1))
    .subscribe(params => {
      this.setVal(params);
    });

    // listen on route change
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        this.route.firstChild.params.pipe(take(1))
        .subscribe(params => {
          this.setVal(params);
        });
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
      if (size > 10) {
        this.setErrMsg('El tamaño del archivo excede el máximo establecido. Prueba con un archivo de menos de 10 Mb.');
        this.uploadFileError = true;
        return;
      }

      let obj: any = this.form.value;
      this.uploadFileProgress = true;
      this.fileName = this.fileObj.name.replace(/[^\w\s\.\_\-]/gi, '');
      obj.displayName = clone(this.fileName);
      this.fileName = `${new Date().getTime()}_${this.fileName}`;
      obj.file = this.fileObj;
      if (this.uploadPath) {
        obj.key = `${this.uploadPath}/${this.fileName}`;
      } else {
        obj.key = `${this.drivePath}/${this.fileName}`;
      }
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

  private getFormatedDate() {
    let today = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;
  }

  private hitApi(obj) {
    let today = this.getFormatedDate();
    let userId: any = (this.activeUser) ? this.activeUser.id : this.userData.id;
    obj.userId = userId;
    // setting email details
    if (obj.uploadedBy === 'admin' && this.activeUser) {
      // file uploaded by admin for some other user
      // obj.generatedFor = 'user';
      this.getEmailContentFromAdmin(obj, today, obj.displayName, obj.folderName, this.activeUser.displayName);
    } else if (obj.uploadedBy === 'user') {
      // obj.generatedFor = 'admin';
      this.getEmailContentFromClient(obj, today, obj.displayName, obj.folderName, this.userData.display_name);
    }
    this.userService.insertFileEntry(obj)
    .then(result => {
      this.getS3Files();
      this.uploadFileError = false;
      this.uploadFileProgress = false;
      this.uploadFileSuccess = true;
      this.uploadMsg = this.translate.instant('upload.msg', { fileName: this.fileName });
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
    let eml: any = (this.activeUser) ? this.activeUser.email : this.userData.user_email;
    this.form = this.fb.group({
      email: [eml, Validators.required],
      note: [null],
      file: [null, Validators.required]
    });
  }

  private getDrivePath() {
    let eml: any = (this.activeUser) ? this.activeUser.email : this.userData.user_email;
    this.drivePath = `${eml}/${this.activeFolderName}`;
  }

  private getS3Files() {
    // initiate get files req and reset after a delay
    this.store.dispatch(this.userActions.triggerFileReq(true));
    setTimeout(() => {
      this.store.dispatch(this.userActions.triggerFileReq(false));
    }, 1000);
  }

  private findActiveUser(id: number) {
    this.allUsers$.pipe(take(3)).subscribe(res => {
      if (res && res.length) {
        this.activeUser = find(res, ['id', id]);
        this.initForm();
      }
    });
  }

  private setErrMsg(str) {
    this.uploadErrorMsg = this.translate.instant('upload.err', { msg: str });
  }

  private getEmailContentFromAdmin(obj, date, fileName, folderName, user) {
    let name = `${this.userData.first_name} ${this.userData.last_name}`;
    if (!name || name === '') {
      name = this.userData.display_name;
    }
    // set data for admin
    obj.emailDataForAdmin = {};
    obj.emailDataForAdmin.to = this.userData.user_email;
    obj.emailDataForAdmin.from = obj.email;
    obj.emailDataForAdmin.senderName = user;
    obj.emailDataForAdmin.recieverName = name;
    obj.emailDataForAdmin.subject = `Archivo ${fileName} para cliente ${user} compartido con éxito con fecha ${date}`;
    // tslint:disable-next-line: max-line-length
    obj.emailDataForAdmin.body = `El archivo ${fileName} ha sido compartido con éxito con el cliente ${user} por Consultax con fecha ${date} en la carpeta ${folderName}`;

    // set data for client
    obj.emailDataForClient = {};
    obj.emailDataForClient.to = obj.email;
    obj.emailDataForClient.from = this.userData.user_email;
    obj.emailDataForClient.senderName = name;
    obj.emailDataForClient.recieverName = user;
    obj.emailDataForClient.subject = `Consultax ha compartido el archivo ${fileName} contigo con fecha ${date} en la carpeta ${folderName} de tu Área de Cliente`;
    // tslint:disable-next-line: max-line-length
    obj.emailDataForClient.body = `Consultax ha compartido contigo el archivo ${fileName} con fecha ${date} en la carpeta ${folderName} de tu Área de Cliente.<br>Puedes acceder a tu Área de Cliente <strong><a href="https://consult.tax/clientes/">aquí.</a></strong>`;
    return obj;
  }

  private getEmailContentFromClient(obj, date, fileName, folderName, user) {
    let name = `${this.userData.first_name} ${this.userData.last_name}`;
    if (!name || name === '') {
      name = this.userData.display_name;
    }
    // set data for admin
    obj.emailDataForAdmin = {};
    obj.emailDataForAdmin.from = obj.email;
    obj.emailDataForAdmin.to = null;
    obj.emailDataForAdmin.senderName = name;
    obj.emailDataForAdmin.recieverName = null;
    obj.emailDataForAdmin.subject = `El cliente ${fileName} ha subido el archivo ${user} en la carpeta ${folderName} con fecha ${date}`;
    // tslint:disable-next-line: max-line-length
    obj.emailDataForAdmin.body = `El cliente ${fileName} ha subido el archivo ${user} en la carpeta ${folderName} con fecha ${date}`;

    // set data for client
    obj.emailDataForClient = {};
    obj.emailDataForClient.from = null;
    obj.emailDataForClient.to = obj.email;
    obj.emailDataForClient.senderName = null;
    obj.emailDataForClient.recieverName = name;
    obj.emailDataForClient.subject = `Tu archivo ${fileName} ha sido cargado con éxito con fecha ${date} en la carpeta ${folderName} de tu Área de Cliente`;
    // tslint:disable-next-line: max-line-length
    obj.emailDataForClient.body = `Tu archivo ${fileName} ha sido cargado con éxito con fecha ${date} en la carpeta ${folderName} de tu Área de Cliente.<br>Puedes acceder a tu Área de Cliente <strong><a href="https://consult.tax/clientes/">aquí.</a></strong>`;
    return obj;
  }

  private setVal(params?) {
    if (params) {
      this.activeFolderName = last(Object.values(params));
    } else {
      this.activeFolderName = MY_FILES;
    }
  }

}
