import { NgModule } from '@angular/core';
import { SvgComponent } from './svg.component';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [CommonModule],
	declarations: [SvgComponent],
	exports: [SvgComponent],
})
export class SvgModule {}
