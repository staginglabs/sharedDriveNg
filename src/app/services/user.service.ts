import { Injectable } from '@angular/core';
import { ISignInRequest, ISignInResponse, ITokenReq, BaseResponse, IChangePasswordReq, ISuccessRes, IUserDetailsData, IFileForm, IS3FilesReq } from '../models';
import { HttpWrapperService } from './http-wrapper.service';
import { USER_URIS } from '../uris';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(
    private http: HttpWrapperService
  ) { }

  public changePassword(payload: IChangePasswordReq): Promise<BaseResponse<ISuccessRes, IChangePasswordReq>> {
    const url = USER_URIS.changePassword;
    return this.http.post(url, payload);
  }

  public getAllUsers(): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.getAllUsers;
    return this.http.get(url);
  }

  public getUserInfo(): Promise<BaseResponse<IUserDetailsData, any>> {
    const url = USER_URIS.getUserInfo;
    return this.http.post(url, {});
  }

  public getUserOrders(): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.getUserOrders;
    return this.http.post(url, {});
  }
  public deleteUsersS3Files(payload: any): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.deleteUsersS3Files;
    return this.http.post(url, payload);
  }
  public updateUserDetails(payload: any): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.updateUserDetails;
    return this.http.post(url, payload);
  }

  public insertFileEntry(payload: IFileForm): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.insertFiles;
    return this.http.post(url, payload);
  }

  public getS3Folders(userId: string): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.getUsersS3Folders.replace(':userId', userId);
    return this.http.get(url);
  }

  public createFolderForUser(payload: any): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.createFolderForUser;
    return this.http.post(url, payload);
  }

  public deleteUserFolder(payload: any): Promise<BaseResponse<any, any>> {
    const url = USER_URIS.deleteUserFolder;
    return this.http.post(url, payload);
  }

  public getS3Files(payload: IS3FilesReq): Promise<BaseResponse<any, any>> {
    // ?userId=1&folderName=myfiles
    const url = USER_URIS.getUsersS3Files.replace(':userId', payload.userId).replace(':folderName', payload.folderName);
    return this.http.get(url);
  }
}
