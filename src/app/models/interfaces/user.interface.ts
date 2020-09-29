import { Observable } from 'rxjs';

export type SortColumn = keyof any | '';
export type SortDirection = 'asc' | 'desc' | '';

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

export interface IChangePasswordReq {
  newpassword: string;
  ccpassword: string;
}

export interface IBreadCrumb {
  level: number;
  value: string;
  id?: string;
}

export interface ICreateFolderDetails {
  name: string;
  id: string;
  description: string;
  childrens: ICreateFolderDetails[];
  details?: any[];
}

export interface ICreateFolderReq {
  userId: number;
  parentId?: string;
  data: ICreateFolderDetails;
}

export interface ISuccessRes {
  status: string;
  message: string;
  code?: string;
}

export interface IOrderRes {
  subtotal: any;
  created_at: any;
  payment_details: any;
  id: any;
  billing_address: any;
  currency: any;
  line_items: ILineItem[];
  order_key: string;
  order_number: string;
  status: string;
  updated_at: string;
  total: string;
  total_line_items_quantity: string;
}

export interface IIOrderRootRes {
  status: string;
  data: IOrderRes[];
}

export interface ILineItem {
  id: number;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  price: string;
  quantity: number;
  tax_class?: any;
  name: string;
  product_id: number;
  variation_id: number;
  product_url: string;
  product_thumbnail_url: string;
  sku: string;
  meta: string;
}

export interface IIdAndName {
  id: number;
  name: string;
}

export interface ICountries extends IIdAndName {
  sortname: string;
  phoneCode: number;
}

export interface IStates extends IIdAndName {
  country_id: string;
}

export interface ICities extends IIdAndName {
  state_id: string;
}

export interface IAddress {
  first_name: string;
  last_name: string;
  company: string;
  country: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: number;
  phone: number;
  email: string;
}

export interface IBillingDetails {
  billing_first_name: string;
  billing_last_name: string;
  billing_company: string;
  billing_country: string;
  billing_address_1: string;
  billing_address_2: string;
  billing_city: string;
  billing_state: string;
  billing_postcode: number;
  billing_phone: number;
  billing_email: string;
}

export interface IShippingDetails {
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_company: string;
  shipping_country: string;
  shipping_address_1: string;
  shipping_address_2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postcode: number;
  shipping_phone: number;
  shipping_email: string;
}

// user details data
export interface IUserDetailsData {
  id: string;
  user_nicename: string;
  user_email?: any;
  display_name?: any;
  first_name: string;
  last_name: string;
  token: string;
  billing: IBillingDetails;
  shipping: IShippingDetails;
  is_admin?: boolean;
  billing_phone?: number;
  company_name?: string;
}

export interface IUserDetailsRoot {
  status: string;
  data: IUserDetailsData;
}

export interface IS3UploadRes {
  Bucket: string;
  Key: string;
  Location: string;
  key: string;
}

export interface IS3DownloadRes {
  Body: Uint8Array;
  ContentLength: number;
  ContentType: string;
  LastModified: Date;
  Metadata: any;
}

export interface IS3FilesReq {
  folderName: string;
  userId: string;
}

export interface IFileFormRes {
  displayName?: string;
  id?: number;
  isDeleted?: boolean;
  key?: string;
  lastModified?: number;
  name?: string;
  note?: string;
  uploadedBy?: 'user' | 'admin';
}

export interface IFileForm extends IFileFormRes {
  type?: string;
  location?: string;
  file?: any;
  email?: string;
  folderName?: string;
  folderNameForUI?: string;
  userId?: string;
  generatedFor?: string;
  emailDataForClient?: any;
  emailDataForAdmin?: any;
}

export interface IFileItems extends IFileForm {
  file: any;
  name: string;
  note: string;
  inProgress: boolean;
  progress: Observable<number>;
  isUploadingFinished?: boolean;
  uploadFileError?: boolean;
  uploadErrorMsg?: string;
  uploadMsg?: any;
  s3UploadCompleted?: boolean;
}

export interface IUserUploadObj extends IFileForm {
  // time
  LastModified: string;

  isUploadedByUser: boolean;
  // if false
  // folder name
  /**
   * URL of the uploaded object.
   */
  Location: string;
  /**
   * ETag of the uploaded object.
   */
  ETag: string;
  /**
   * Bucket to which the object was uploaded.
   */
  Bucket: string;
  /**
   * Key to which the object was uploaded.
   */
  Key: string;
}


export interface IUserList {
  id: number;
  isOffline: boolean;
  createdDate: string;
  email: string;
  name: string;
  userStatus: string;
  displayName: string;
}
