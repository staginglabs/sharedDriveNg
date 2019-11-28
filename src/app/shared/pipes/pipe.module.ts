import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalPipeFunction, FilterPipe } from '.';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FilterPipe,
    UniversalPipeFunction
  ],
  exports: [
    FilterPipe,
    UniversalPipeFunction
  ]
})
export class PipeModule {}
