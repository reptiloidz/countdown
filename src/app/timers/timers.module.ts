import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimersComponent } from './timers.component';
import { BoardModule } from '../components/board/board.module';

@NgModule({
	imports: [CommonModule, BoardModule],
	declarations: [TimersComponent],
	exports: [TimersComponent],
})
export class TimersModule {}
