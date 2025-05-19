import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { AuthComponent } from './pages/personal/components/auth/auth.component';
import { authGuard, leaveUrlGuard } from './guards';
import { noPointGuard } from './guards/noPoint.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: '',
		pathMatch: 'full',
	},
	{
		path: '',
		component: MainListComponent,
		canActivate: [leaveUrlGuard, noPointGuard],
	},
	{
		path: 'point/:id',
		loadChildren: () => import('./pages/point-page/point-page.module').then(m => m.PointPageModule),
		canActivate: [leaveUrlGuard],
	},
	{
		path: 'url',
		loadChildren: () => import('./pages/point-page/point-page.module').then(m => m.PointPageModule),
		canActivate: [leaveUrlGuard],
	},
	{
		path: 'auth',
		component: AuthComponent,
		canActivate: [leaveUrlGuard, noPointGuard, authGuard],
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
		loadChildren: () => import('./pages/personal/personal.module').then(m => m.PersonalModule),
		canActivate: [leaveUrlGuard],
	},
	{
		path: '**',
		loadChildren: () => import('./pages/no-page/no-page.module').then(m => m.NoPageModule),
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {
			preloadingStrategy: PreloadAllModules,
			enableViewTransitions: true,
		}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
