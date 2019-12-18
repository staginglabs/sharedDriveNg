import { environment } from 'src/environments/environment';

// tslint:disable-next-line: max-line-length
export const USER_ICON_PATH = `./assets/images/user.svg`;
export const EMAIL_REGEX = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
export const MY_FILES = 'myfiles';
export const BUCKET = {
  NAME: environment.BUCKET_NAME,
  BASE_URL: environment.BUCKET_BASE_URL,
  ACCESS: environment.BUCKET_ACCESS,
  SECRET: environment.BUCKET_SECRET,
  POOL_ID: environment.BUCKET_POOL_ID
};
