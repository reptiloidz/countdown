import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointComponent } from './point/point.component';
import { readGuard } from '../../guards';
import { PointModule } from './point.module';
import { ModeStatsComponent } from 'src/app/components/mode-stats/mode-stats.component';
import { SharedModule } from 'src/app/shared.module';

const routes: Routes = [
	{
		path: '',
		component: PointComponent,
		canActivate: [readGuard],
	},
];

@NgModule({
	imports: [PointModule, SharedModule, RouterModule.forChild(routes)],
	declarations: [ModeStatsComponent],
	exports: [RouterModule, ModeStatsComponent],
})
export class PointPageModule {}
