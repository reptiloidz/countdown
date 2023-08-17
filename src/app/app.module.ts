import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainListComponent } from './components/main-list/main-list.component';
import { MainItemComponent } from './components/main-item/main-item.component';
import { PointComponent } from './components/point/point.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EditPointComponent } from './components/edit-point/edit-point.component';
import { CreatePointComponent } from './components/create-point/create-point.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpService } from './services/http.service';
import { HttpService as MockHttpService } from './services/http.mock.service';

@NgModule({
	declarations: [
		AppComponent,
		MainListComponent,
		MainItemComponent,
		PointComponent,
		HeaderComponent,
		FooterComponent,
		EditPointComponent,
		CreatePointComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
	],
	providers: [
		// { provide: HttpService, useClass: MockHttpService }
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
