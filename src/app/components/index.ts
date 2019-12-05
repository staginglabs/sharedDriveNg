import { LoginComponent } from './login';
import { TokenVerifyComponent } from './token-verify';
import { DummyComponent } from './dummy';
import { HeaderComponent } from './header';
import { FooterComponent } from './footer';
import { CreateDriveS3Component } from './create-drive-s3';
import { DeleteModalComponent } from './delete-modal';
import { NotesModalComponent } from '../modules/+drive';

export { LoginComponent } from './login';
export { TokenVerifyComponent } from './token-verify';
export { DummyComponent } from './dummy';
export { CreateDriveS3Component } from './create-drive-s3';
export { DeleteModalComponent } from './delete-modal';

export const ENTRY_COMPONENTS = [
  DeleteModalComponent,
  NotesModalComponent
];

export const CORE_COMPONENTS = [
  HeaderComponent,
  FooterComponent
];

export const ALL_COMPONENTS: any[] = [
  LoginComponent,
  TokenVerifyComponent,
  DummyComponent,
  CreateDriveS3Component
];
