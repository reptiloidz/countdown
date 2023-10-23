import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { PointComponent } from './components/point/point.component';
import { EditPointComponent } from './components/edit-point/edit-point.component';
import { CreatePointComponent } from './components/create-point/create-point.component';
import { AuthComponent } from './personal/components/auth/auth.component';

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
	},
	{
		path: 'auth',
		component: AuthComponent,
	},
	{
		path: 'edit/:id',
		component: EditPointComponent,
	},
	{
		path: 'create',
		component: CreatePointComponent,
	},
	{
		path: 'auth',
		loadChildren: () =>
			import('./personal/personal.module').then((m) => m.PersonalModule),
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
