import { NgModule } from '@angular/core';
import { TimeRemainTextPipe } from '../pipes/time-remain-text.pipe';
import { TimeRemainPipe } from '../pipes/time-remain.pipe';

@NgModule({
	declarations: [TimeRemainTextPipe, TimeRemainPipe],
	exports: [TimeRemainTextPipe, TimeRemainPipe],
})
export class RemainModule {}
