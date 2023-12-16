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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { HttpService } from './services/http.service';
import { HttpService as MockHttpService } from './services/http.mock.service';
import { GenerateIterationsComponent } from './components/generate-iterations/generate-iterations.component';
import { SortPipe } from './pipes/sort.pipe';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { PrivacyComponent } from './components/privacy/privacy.component';

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
		GenerateIterationsComponent,
		SortPipe,
		PrivacyComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		NgxMaskDirective,
		provideFirebaseApp(() =>
			initializeApp({
				projectId: 'countdown-2971d',
				appId: '1:711051586210:web:f9be0c6579bbb2608d85fb',
				databaseURL:
					'https://countdown-2971d-default-rtdb.firebaseio.com',
				storageBucket: 'countdown-2971d.appspot.com',
				apiKey: 'AIzaSyAqSOHSqWdyzx2GKWK33AqIIRgimEjVFak',
				authDomain: 'countdown-2971d.firebaseapp.com',
				messagingSenderId: '711051586210',
				measurementId: 'G-XRDWYMHR2Y',
			})
		),
		provideAuth(() => getAuth()),
		provideFirestore(() => getFirestore()),
		provideDatabase(() => getDatabase()),
	],
	providers: [
		// { provide: HttpService, useClass: MockHttpService },
		[provideNgxMask()],
		SortPipe,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
