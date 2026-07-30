import { Routes } from '@angular/router';
import { readGuard } from '../../guards';

export const pointPageRoutes: Routes = [
	{
		path: '',
		loadComponent: () => import('./point/point.component').then(m => m.PointComponent),
		canActivate: [readGuard],
	},
];
