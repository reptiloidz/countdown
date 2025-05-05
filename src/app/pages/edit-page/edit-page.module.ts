import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { editGuard } from '../../guards';
import { SharedModule } from '../../shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BoardModule } from '../../components/board/board.module';
import { TimersModule } from '../../timers/timers.module';
import { EditPointComponent } from './edit-point/edit-point.component';
import { PointModesComponent } from './point-modes/point-modes.component';
import { GenerateIterationsComponent } from '../../components/generate-iterations/generate-iterations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClockModule } from '../../components/clock/clock.module';
import { MainItemModule } from '../../components/main-item/main-item.module';
import { PointModule } from '../point-page/point.module';
import { SvgModule } from 'src/app/components/svg/svg.module';
import { RadioComponent } from 'src/app/components/radio/radio.component';

const routes: Routes = [
	{
		path: '',
		component: EditPointComponent,
		canActivate: [editGuard],
	},
];

@NgModule({
	imports: [
		CommonModule,
		SvgModule,
		SharedModule,
		ScrollingModule,
		BoardModule,
		TimersModule,
		PointModule,
		FormsModule,
		ReactiveFormsModule,
		ClockModule,
		MainItemModule,
		RouterModule.forChild(routes),
	],
	declarations: [EditPointComponent, PointModesComponent, RadioComponent, GenerateIterationsComponent],
	exports: [EditPointComponent, PointModesComponent, RadioComponent, GenerateIterationsComponent],
})
export class EditPageModule {}
