import { Routes } from '@angular/router';
import { authGuard, leaveUrlGuard, unauthGuard } from '../../guards';
import { noPointGuard } from 'src/app/guards/noPoint.guard';

export const personalRoutes: Routes = [
	{
		path: 'auth',
		loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent),
		canActivate: [leaveUrlGuard, noPointGuard, authGuard],
		data: { state: 'auth' },
	},
	{
		path: 'reg',
		loadComponent: () => import('./components/reg/reg.component').then(m => m.RegComponent),
		canActivate: [leaveUrlGuard, authGuard],
		data: { state: 'reg' },
	},
	{
		path: 'profile',
		loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
		canActivate: [unauthGuard],
		data: { state: 'profile' },
	},
];
