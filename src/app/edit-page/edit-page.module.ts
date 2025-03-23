import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { editGuard } from '../guards';
import { SharedModule } from '../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BoardModule } from '../board/board.module';
import { TimersModule } from '../timers/timers.module';
import { EditPointComponent } from './edit-point/edit-point.component';
import { PointModesComponent } from './point-modes/point-modes.component';
import { GenerateIterationsComponent } from '../components/generate-iterations/generate-iterations.component';
import { RadioComponent } from '../components/radio/radio.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClockModule } from '../clock/clock.module';
import { MainItemModule } from '../main-item/main-item.module';
import { PointModule } from '../point-page/point.module';

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
	declarations: [EditPointComponent, PointModesComponent, GenerateIterationsComponent, RadioComponent],
	exports: [EditPointComponent, PointModesComponent, GenerateIterationsComponent, RadioComponent],
})
export class EditPageModule {}
