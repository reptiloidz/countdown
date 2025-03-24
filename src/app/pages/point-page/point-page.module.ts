import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointComponent } from './point/point.component';
import { readGuard } from '../../guards';
import { PointModule } from './point.module';

const routes: Routes = [
	{
		path: '',
		component: PointComponent,
		canActivate: [readGuard],
	},
];

@NgModule({
	imports: [PointModule, RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PointPageModule {}
