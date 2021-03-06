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
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgbdSortableHeaderDirective } from './directives';

@NgModule({
  declarations: [
    LoaderComponent,
    ENTRY_COMPONENTS,
    CORE_COMPONENTS,
    COMMON_EXP_COMPOS,
    NgbdSortableHeaderDirective
  ],
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    RouterModule,
    NgSelectModule,
    TranslateModule
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
    LoaderComponent,
    TranslateModule,
    NgbdSortableHeaderDirective
  ]
})
export class SharedModule {}
