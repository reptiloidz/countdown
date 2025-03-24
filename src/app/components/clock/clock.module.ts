import { NgModule } from '@angular/core';
import { ClockComponent } from './clock.component';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [CommonModule],
	declarations: [ClockComponent],
	exports: [ClockComponent],
})
export class ClockModule {}
