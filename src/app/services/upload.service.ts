/// <reference types="aws-sdk" />
import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import { FileSaverService } from './file-saver.service';
import { BUCKET } from '../app.constant';
import { IS3DownloadRes } from '../models';

// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-east-2';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: BUCKET.POOL_ID,
});
AWS.config.update({
  accessKeyId: BUCKET.ACCESS,
  secretAccessKey: BUCKET.SECRET
});
let s3 = new S3({
  apiVersion: '2006-03-01',
  params: { Bucket: BUCKET.NAME }
});

@Injectable({ providedIn: 'root' })
export class UploadService {

  constructor(
    private fileSaverService: FileSaverService
  ) { }

  public uploadfile(obj: any): Promise<any> {
    const params = {
      Bucket: BUCKET.NAME,
      Key: `${obj.key}`,
      Body: obj.file,
      ContentType: obj.file.type
    };
    const bucket = new S3.ManagedUpload({params});
    return new Promise((resolve, reject) => {
      bucket.send((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public downloadFile(Key: string, name: string) {
    let params = {
      Bucket: BUCKET.NAME,
      Key
    };
    s3.getObject(params, (err, data: any) => {
      if (err) {
        console.log(err);
      } else {
        this.fileSaverService.save(data.Body, name, data.ContentType);
      }
    });
  }

  public listFiles() {
    let params = {
      Bucket: BUCKET.NAME,
      // Delimiter: '/'
    };
    s3.listObjects(params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  }

  public createFolder(name: string): Promise<any> {
    name = name.trim();
    return new Promise((resolve, reject) => {
      if (!name) {
        reject('Album names must contain at least one non-space character.');
      }
      if (name.indexOf('/') !== -1) {
        reject('Album names cannot contain slashes.');
      }
      let Key = encodeURIComponent(name) + '/';
      let params = {
        Bucket: BUCKET.NAME,
        Key
      };
      s3.putObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({msg: 'Folder Created Successfully!'});
        }
      });
    });
  }
}
