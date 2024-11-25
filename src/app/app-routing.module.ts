import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { PointComponent } from './components/point/point.component';
import { EditPointComponent } from './components/edit-point/edit-point.component';
import { AuthComponent } from './personal/components/auth/auth.component';
import { readGuard, editGuard, authGuard } from './guards';
import { NoPageComponent } from './components/no-page/no-page.component';
import { shortGuard } from './guards/short.guard';
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
		component: PointComponent,
		canActivate: [readGuard],
	},
	{
		path: 'url',
		component: PointComponent,
	},
	{
		path: 'auth',
		component: AuthComponent,
		canActivate: [noPointGuard, authGuard],
	},
	{
		path: 'edit/:id',
		component: EditPointComponent,
		canActivate: [editGuard],
	},
	{
		path: 'create',
		component: EditPointComponent,
		canActivate: [editGuard],
	},
	{
		path: 'create-url',
		component: EditPointComponent,
	},
	{
		path: '',
		loadChildren: () =>
			import('./personal/personal.module').then((m) => m.PersonalModule),
	},
	{
		path: '**',
		component: NoPageComponent,
		canActivate: [noPointGuard, shortGuard],
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
