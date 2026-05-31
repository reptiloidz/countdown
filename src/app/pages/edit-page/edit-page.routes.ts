import { Routes } from '@angular/router';
import { editGuard } from '../../guards';

export const editPageRoutes: Routes = [
	{
		path: '',
		loadComponent: () => import('./edit-point/edit-point.component').then(m => m.EditPointComponent),
		canActivate: [editGuard],
	},
];
