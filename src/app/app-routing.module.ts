import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainListComponent } from './components/main-list/main-list.component';
import { EventComponent } from './components/event/event.component';
import { EditEventComponent } from './components/edit-event/edit-event.component';
import { CreateEventComponent } from './components/create-event/create-event.component';

const routes: Routes = [
	{
		path: '',
		component: MainListComponent,
	},
	{
		path: 'event/:id',
		component: EventComponent,
	},
	{
		path: 'edit/:id',
		component: EditEventComponent,
	},
	{
		path: 'create',
		component: CreateEventComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
