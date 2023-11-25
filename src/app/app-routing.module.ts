import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { PointComponent } from './components/point/point.component';
import { EditPointComponent } from './components/edit-point/edit-point.component';
import { CreatePointComponent } from './components/create-point/create-point.component';
import { AuthComponent } from './personal/components/auth/auth.component';
import { authGuard } from './services/auth.guard';
import { editGuard } from './services/edit.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/',
		pathMatch: 'full',
	},
	{
		path: '',
		component: MainListComponent,
		canActivate: [authGuard],
	},
	{
		path: 'point/:id',
		component: PointComponent,
		canActivate: [authGuard],
	},
	{
		path: 'auth',
		component: AuthComponent,
	},
	{
		path: 'edit/:id',
		component: EditPointComponent,
		canActivate: [authGuard, editGuard],
	},
	{
		path: 'create',
		component: CreatePointComponent,
		canActivate: [authGuard],
	},
	{
		path: '',
		loadChildren: () =>
			import('./personal/personal.module').then((m) => m.PersonalModule),
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
