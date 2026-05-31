import { NgModule } from '@angular/core';
import { PointComponent } from './point/point.component';
import { PanelComponent } from './panel/panel.component';
import { DatePanelComponent } from './date-panel/date-panel.component';
import { CheckCopiesPipe } from '../../pipes/check-copies.pipe';

/** Re-export для edit-page до PR-4c */
@NgModule({
	imports: [PointComponent, PanelComponent, DatePanelComponent, CheckCopiesPipe],
	exports: [PointComponent, PanelComponent, DatePanelComponent, CheckCopiesPipe],
})
export class PointModule {}
