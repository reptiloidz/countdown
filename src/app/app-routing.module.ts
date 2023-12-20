import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { PointComponent } from './components/point/point.component';
import { EditPointComponent } from './components/edit-point/edit-point.component';
import { CreatePointComponent } from './components/create-point/create-point.component';
import { AuthComponent } from './personal/components/auth/auth.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { readGuard } from './services/read.guard';
import { editGuard } from './services/edit.guard';
import { authGuard } from './services/auth.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/',
		pathMatch: 'full',
	},
	{
		path: '',
		component: MainListComponent,
	},
	{
		path: 'point/:id',
		component: PointComponent,
		canActivate: [readGuard],
	},
	{
		path: 'auth',
		component: AuthComponent,
		canActivate: [authGuard],
	},
	{
		path: 'privacy',
		component: PrivacyComponent,
	},
	{
		path: 'edit/:id',
		component: EditPointComponent,
		canActivate: [editGuard],
	},
	{
		path: 'create',
		component: CreatePointComponent,
		canActivate: [editGuard],
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
