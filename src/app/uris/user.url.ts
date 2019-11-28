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
  getUsersS3Folders: `${url}getUsersFolders`,
  getUsersS3Files: `${url}getUsersS3Files`,
  deleteUsersS3Files: `${url}deleteUsersS3Files`,
};
