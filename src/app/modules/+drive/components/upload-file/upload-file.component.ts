import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { UserActions } from 'src/app/actions';
import { ReplaySubject, Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil, take, filter } from 'rxjs/operators';
import { IUserData, IFileForm, IS3UploadRes, IUserList, IUserDetailsData, ICreateFolderDetails, IFileItems } from 'src/app/models';
import { UploadService } from 'src/app/services/upload.service';
import { UserService } from 'src/app/services';
import { clone, find, last, isEmpty } from 'src/app/lodash.optimized';
import { MY_FILES } from 'src/app/app.constant';
import { TranslateService } from '@ngx-translate/core';
import { LocalService } from 'src/app/services/local.service';
const SIZEMSG = 'El tamaño del archivo excede el máximo establecido. Prueba con un archivo de menos de 10 Mb.';
const ERR_MSG = 'algo salió mal';

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
  public activeFolderData: ICreateFolderDetails;
  public files: IFileItems[];
  public errFiles: any[];
  private fileObj: any;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  constructor(
    public translate: TranslateService,
    private localService: LocalService,
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
    });

    // listen for token and user details
    this.store.pipe(select(p => p.auth.details), take(1))
    .subscribe(d => {
      this.data = d;
    });

    // listen for params and set active folder
    try {
      this.route.firstChild.params.pipe(take(1))
      .subscribe(params => {
        if (params) {
          this.setVal(params);
        }
      });
    } catch (error) {
      this.route.params.pipe(take(1))
      .subscribe(params => {
        if (params) {
          this.setVal(params);
        }
      });
    }

    // listen on route change
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd)).subscribe(resp => {
      if (resp) {
        if (this.route && this.route.firstChild) {
          this.route.firstChild.params.pipe(take(1))
          .subscribe(params => {
            this.setVal(params);
          });
        }
      }
    });

  }

  public openDialog(template) {
    this.resetLoadState();
    this.getDrivePath();
    this.modalRef = this.modalService.open(template, { windowClass: 'customPrimary' });
  }

  public dismissModal(reason) {
    this.files = [];
    this.errFiles = [];
    this.modalRef.close();
  }

  public removeFile(index) {
    this.files.splice(index, 1);
  }

  public triggerUploadFile(event: MouseEvent) {
    if (event) {
      this.fileObj = null;
      document.getElementById('fileInpt').click();
    }
  }

  public onfileInputChange(event: any) {
    if (event) {
      this.files = [];
      this.errFiles = [];
      const length: number = event.srcElement.files.length > 10 ? 10 : event.srcElement.files.length;
      for (let i = 0; i < length; i++) {
        const file = event.srcElement.files[i];
        let size = file.size / 1024 / 1024;
        if (size > 10) {
          const m = `${this.translate.instant('table.name', {})}: ${file.name}, ${SIZEMSG}`;
          const msg = this.translate.instant('upload.err', { msg: m });
          this.errFiles.push({ data: file, name, msg, size});
        } else {
          this.files.push({
            file,
            name: file.name.replace(/[^\w\s\.\_\-]/gi, ''),
            note: '',
            inProgress: false,
            progress: of(0),
            s3UploadCompleted: false,
            isUploadingFinished: false,
            email: (this.activeUser) ? this.activeUser.email : this.userData.user_email
          });
        }
      }
    }
  }

  public uploadFileProcessStart(e: any) {
    if (e && this.files && this.files.length) {
      this.files.forEach((item, index) => {
        setTimeout(() => {
          item.inProgress = true;
          item.progress = of(1);
          item.progress = of(3);
          this.uploadFile(item);
        }, 200 * index);
      });
    }
  }

  public uploadFile(item: IFileItems) {
    if (item && item.file) {
      item.progress = of(7);
      this.uploadFileProgress = true;
      item.displayName = clone(item.name);
      item.name = `${new Date().getTime()}_${item.name}`;
      if (this.uploadPath) {
        item.key = `${this.uploadPath}/${item.name}`;
      } else {
        item.key = `${this.drivePath}/${item.name}`;
      }
      // handle for zip and dmg and few other types
      item.type = item.file.type || `application/${item.name.split('.').pop()}`;
      item.folderName = (this.activeFolderData) ? this.activeFolderData.id : this.activeFolderName;
      item.folderNameForUI = (this.activeFolderData) ? this.activeFolderData.name : this.activeFolderName;
      this.doUploadFile(item);
    }
  }

  private doUploadFile(item: IFileItems) {
    item.progress = of(10);
    this.uploadService.uploadfile(item)
    .then((res: any) => {
      item.key = res.Key;
      item.location = res.Location;
      item.s3UploadCompleted = true;
      this.hitApi(item);
    }).catch((err: any) => {
      item.uploadFileError = true;
      item.uploadErrorMsg = err;
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

  private hitApi(obj: IFileItems) {
    obj.progress = of(50);
    obj.id = new Date().getTime();
    obj.lastModified = clone(obj.id);
    obj.isDeleted = false;
    obj.uploadedBy = this.findUploader();
    obj.progress = of(60);
    let today = this.getFormatedDate();
    let userId: any = (this.activeUser) ? this.activeUser.id : this.userData.id;
    obj.userId = userId;
    // setting email details
    if (obj.uploadedBy === 'admin' && this.activeUser) {
      // file uploaded by admin for some other user
      obj.generatedFor = 'user';
      this.getEmailContentFromAdmin(obj, today, obj.displayName, obj.folderNameForUI, this.activeUser.displayName);
    } else if (obj.uploadedBy === 'user') {
      obj.generatedFor = 'admin';
      this.getEmailContentFromClient(obj, today, obj.displayName, obj.folderNameForUI, this.userData.display_name);
    }
    this.s3Toll();
  }

  private s3Toll() {
    let finished = 0;
    let errored = 0;
    const total = this.files.length;
    this.files.forEach(item => {
      if (item.s3UploadCompleted && !item.uploadFileError) {
        finished++;
      } else if (item.uploadFileError) {
        errored++;
      }
    });
    if (total === (finished + errored)) {
      this.doFinal();
    }
  }

  private doFinal() {
    this.files.forEach((obj, index) => {
      setTimeout(() => {
        this.userService.insertFileEntry(obj)
        .then(result => {
          obj.progress = of(100);
          obj.isUploadingFinished = true;
          obj.uploadMsg = this.translate.instant('upload.msg', { fileName: obj.name });
        })
        .catch(err => {
          obj.uploadFileError = true;
          obj.uploadErrorMsg = this.translate.instant('upload.err', { msg: ERR_MSG });
          console.log('[S3 ERROR]', err);
        })
        .finally(() => {
          this.checkTaskHasEnded();
        });
      }, 500 * index);
    });
  }

  private checkTaskHasEnded() {
    let finished = 0;
    let errored = 0;
    const total = this.files.length;
    this.files.forEach(item => {
      if (item.isUploadingFinished) {
        finished++;
      } else if (item.uploadFileError) {
        errored++;
      }
    });
    if (total === (finished + errored)) {
      this.uploadFileSuccess = true;
      this.getS3Files();
    }
  }

  private findUploader(): 'user' | 'admin' {
    if (this.activeFolderName === MY_FILES) {
      return (this.data && this.data.is_admin) ? 'admin' : 'user';
    } else {
      return 'admin';
    }
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
    if (!isEmpty(params) && params && !params['userId']) {
      this.activeFolderName = last(Object.values(params));
    } else {
      this.activeFolderName = MY_FILES;
    }
    if (this.activeFolderName !== MY_FILES) {
      this.store.pipe(select(p => p.user.folders), take(3))
      .subscribe(r => {
        if (r && r.length && this.activeFolderName) {
          this.activeFolderData = this.localService.findItemRecursively(r, this.activeFolderName);
        }
      });
    }
  }

}
