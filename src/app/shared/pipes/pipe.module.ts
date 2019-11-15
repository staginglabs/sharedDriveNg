import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalPipeFunction } from '.';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UniversalPipeFunction
  ],
  exports: [
    UniversalPipeFunction
  ]
})
export class PipeModule {}
