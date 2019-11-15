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
