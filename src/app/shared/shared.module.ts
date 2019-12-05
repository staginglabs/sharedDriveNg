import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// common pipe
import {
  PipeModule, LoaderComponent
} from '.';
import { CORE_COMPONENTS, ENTRY_COMPONENTS } from '../components';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { COMMON_EXP_COMPOS } from '../modules/+drive';

@NgModule({
  declarations: [
    LoaderComponent,
    ENTRY_COMPONENTS,
    CORE_COMPONENTS,
    COMMON_EXP_COMPOS
  ],
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    NgSelectModule
  ],
  entryComponents: [
    ENTRY_COMPONENTS
  ],
  exports: [
    NgbModule,
    CORE_COMPONENTS,
    COMMON_EXP_COMPOS,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    NgSelectModule,
    LoaderComponent
  ]
})
export class SharedModule {}
