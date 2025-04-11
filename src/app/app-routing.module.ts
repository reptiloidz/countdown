import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { AuthComponent } from './pages/personal/components/auth/auth.component';
import { authGuard } from './guards';
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
		canActivate: [noPointGuard],
	},
	{
		path: 'point/:id',
		loadChildren: () => import('./pages/point-page/point-page.module').then(m => m.PointPageModule),
	},
	{
		path: 'url',
		loadChildren: () => import('./pages/point-page/point-page.module').then(m => m.PointPageModule),
	},
	{
		path: 'auth',
		component: AuthComponent,
		canActivate: [noPointGuard, authGuard],
	},
	{
		path: 'edit/:id',
		loadChildren: () => import('./pages/edit-page/edit-page.module').then(m => m.EditPageModule),
	},
	{
		path: 'create',
		loadChildren: () => import('./pages/edit-page/edit-page.module').then(m => m.EditPageModule),
	},
	{
		path: 'create-url',
		loadChildren: () => import('./pages/edit-page/edit-page.module').then(m => m.EditPageModule),
	},
	{
		path: '',
		loadChildren: () => import('./pages/personal/personal.module').then(m => m.PersonalModule),
	},
	{
		path: '**',
		loadChildren: () => import('./pages/no-page/no-page.module').then(m => m.NoPageModule),
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
