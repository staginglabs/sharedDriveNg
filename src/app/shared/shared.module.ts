import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// common pipe
import {
  PipeModule
} from '.';
import { CORE_COMPONENTS } from '../components';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    CORE_COMPONENTS
  ],
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    NgSelectModule
  ],
  exports: [
    NgbModule,
    CORE_COMPONENTS,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    NgSelectModule
  ]
})
export class SharedModule {}
