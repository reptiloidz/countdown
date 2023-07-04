import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainListComponent } from './components/main-list/main-list.component';
import { MainItemComponent } from './components/main-item/main-item.component';
import { EventComponent } from './components/event/event.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EditEventComponent } from './components/edit-event/edit-event.component';
import { CreateEventComponent } from './components/create-event/create-event.component';

@NgModule({
	declarations: [
		AppComponent,
		MainListComponent,
		MainItemComponent,
		EventComponent,
		HeaderComponent,
		FooterComponent,
		EditEventComponent,
		CreateEventComponent,
	],
	imports: [BrowserModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
