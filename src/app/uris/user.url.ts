import { baseUrl } from './base.url';
const url = `${baseUrl}wp-json/drive/`;

export const USER_URIS = {
  login: `${url}login`,
  changePassword: `${url}changePassword`,
  getUserOrders: `${url}getUserOrders`,
  updateUserDetails: `${url}updateUserDetails`,
  getUserInfo: `${url}getUserInfo`,
  insertFiles: `${url}insertFiles`,
};
