import { baseUrl } from './base.url';
const url = `${baseUrl}wp-json/drive/`;

export const USER_URIS = {
  login: `${url}login`,
  logout: `${url}logout`,
  changePassword: `${url}changePassword`,
  getUserOrders: `${url}getUserOrders`,
  updateUserDetails: `${url}updateUserDetails`,
  getUserInfo: `${url}getUserInfo`,
  insertFiles: `${url}insertFiles`,
  getUsersS3Files: `${url}getUsersS3Files`,
  performDelete: `${url}performDelete`,
};
