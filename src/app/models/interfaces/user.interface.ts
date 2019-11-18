export interface IIdAndName{
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

export interface IS3UploadRes {
  Bucket: string;
  Key: string;
  Location: string;
  key: string;
}

export interface IFileForm {
  // drive will represent user email
  // drive>myfiles
  location: string;
  note: string;
  email: string;
  file?: any;
  name: string;
  type: string;
  key: string;
  isDeleted: boolean;
  uploadedBy: 'user' | 'admin';
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
