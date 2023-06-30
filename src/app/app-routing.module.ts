import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { EventComponent } from './components/event/event.component';

const routes: Routes = [
	{
		path: '',
		component: MainListComponent,
	},
	{
		path: 'event/:id',
		component: EventComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
