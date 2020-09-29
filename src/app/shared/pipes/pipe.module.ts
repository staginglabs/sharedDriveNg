import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalPipeFunction, FilterPipe, SortByPipe } from '.';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FilterPipe,
    UniversalPipeFunction,
    SortByPipe
  ],
  exports: [
    FilterPipe,
    UniversalPipeFunction,
    SortByPipe
  ]
})
export class PipeModule {}
