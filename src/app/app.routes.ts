import { Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { leaveUrlGuard } from './guards';
import { noPointGuard } from './guards/noPoint.guard';

export const appRoutes: Routes = [
	{
		path: '',
		component: MainListComponent,
		data: { state: 'home' },
		canActivate: [leaveUrlGuard, noPointGuard],
	},
	{
		path: 'point/:id',
		loadChildren: () => import('./pages/point-page/point-page.routes').then(m => m.pointPageRoutes),
		canActivate: [leaveUrlGuard],
	},
	{
		path: 'url',
		loadChildren: () => import('./pages/point-page/point-page.routes').then(m => m.pointPageRoutes),
		canActivate: [leaveUrlGuard],
	},
	{
		path: 'edit/:id',
		loadChildren: () => import('./pages/edit-page/edit-page.module').then(m => m.EditPageModule),
		canActivate: [leaveUrlGuard],
	},
	{
		path: 'create',
		loadChildren: () => import('./pages/edit-page/edit-page.module').then(m => m.EditPageModule),
		canActivate: [leaveUrlGuard],
	},
	{
		path: 'create-url',
		loadChildren: () => import('./pages/edit-page/edit-page.module').then(m => m.EditPageModule),
		canActivate: [leaveUrlGuard],
	},
	{
		path: '',
		loadChildren: () => import('./pages/personal/personal.routes').then(m => m.personalRoutes),
		canActivate: [leaveUrlGuard],
	},
	{
		path: '**',
		loadChildren: () => import('./pages/no-page/no-page.module').then(m => m.NoPageModule),
		data: { state: 'no-page' },
	},
];
