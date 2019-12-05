import { baseUrl } from './base.url';
const url = `${baseUrl}wp-json/drive/`;

export const USER_URIS = {
  login: `${url}login`,
  logout: `${url}logout`,
  changePassword: `${url}changePassword`,
  getUserOrders: `${url}getUserOrders`,
  getAllUsers: `${url}getAllUsers`,
  updateUserDetails: `${url}updateUserDetails`,
  getUserInfo: `${url}getUserInfo`,
  insertFiles: `${url}insertFiles`,
  getUsersS3Folders: `${url}getUsersFolders?userId=:userId`,
  getUsersS3Files: `${url}getUsersS3Files?userId=:userId&folderName=:folderName`,
  deleteUsersS3Files: `${url}deleteUsersS3Files`,
};
