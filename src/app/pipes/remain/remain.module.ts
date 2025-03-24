import { NgModule } from '@angular/core';
import { TimeRemainTextPipe } from '../time-remain-text.pipe';
import { TimeRemainPipe } from '../time-remain.pipe';

@NgModule({
	declarations: [TimeRemainTextPipe, TimeRemainPipe],
	exports: [TimeRemainTextPipe, TimeRemainPipe],
})
export class RemainModule {}
