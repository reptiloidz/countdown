import { NgModule } from '@angular/core';
import { NoPageComponent } from './no-page.component';
import { ClockModule } from '../clock/clock.module';
import { CommonModule } from '@angular/common';
import { noPointGuard } from '../guards/noPoint.guard';
import { shortGuard } from '../guards/short.guard';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		component: NoPageComponent,
		canActivate: [noPointGuard, shortGuard],
	},
];

@NgModule({
	imports: [CommonModule, ClockModule, RouterModule.forChild(routes)],
	declarations: [NoPageComponent],
	exports: [NoPageComponent, RouterModule],
})
export class NoPageModule {}
