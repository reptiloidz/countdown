import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainListComponent } from './components/main-list/main-list.component';
import { MainItemComponent } from './components/main-item/main-item.component';

@NgModule({
	declarations: [AppComponent, MainListComponent, MainItemComponent],
	imports: [BrowserModule, AppRoutingModule],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
