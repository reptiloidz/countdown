import { NgModule } from '@angular/core';
import { PointComponent } from './point/point.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { BoardModule } from '../../components/board/board.module';
import { RemainModule } from '../../pipes/remain/remain.module';
import { SharedModule } from '../../shared.module';
import { TimersModule } from '../../timers/timers.module';
import { CheckCopiesPipe } from '../../pipes/check-copies.pipe';
import { DatePanelComponent } from './date-panel/date-panel.component';
import { PanelComponent } from './panel/panel.component';
import { SvgModule } from '../../components/svg/svg.module';

@NgModule({
	imports: [CommonModule, SharedModule, SvgModule, ScrollingModule, BoardModule, TimersModule, RemainModule],
	declarations: [PointComponent, PanelComponent, DatePanelComponent, CheckCopiesPipe],
	exports: [PointComponent, PanelComponent, DatePanelComponent, CheckCopiesPipe],
})
export class PointModule {}
