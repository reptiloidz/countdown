import { Routes } from '@angular/router';
import { leaveUrlGuard } from 'src/app/guards';
import { noPointGuard } from 'src/app/guards/noPoint.guard';
import { shortGuard } from 'src/app/guards/short.guard';

export const noPageRoutes: Routes = [
	{
		path: '',
		loadComponent: () => import('./no-page.component').then(m => m.NoPageComponent),
		canActivate: [leaveUrlGuard, noPointGuard, shortGuard],
		data: { state: 'no-page' },
	},
];
