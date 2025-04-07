import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainListComponent } from './components/main-list/main-list.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SharedModule } from './shared.module';
import { SortPointsPipe } from './pipes/sort-points.pipe';
import { CheckEditablePointsPipe } from './pipes/check-editable-points.pipe';
import { ColorsCheckPipe } from './pipes/colors-check.pipe';
import { SortTrendingPipe } from './pipes/sort-trending.pipe';
import { FontProvider } from './providers/font.provider';
import { FilterPipe } from './pipes/filter.pipe';
import { DatePointsPopupComponent } from './components/date-points-popup/date-points-popup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ClockModule } from './components/clock/clock.module';
import { BoardModule } from './components/board/board.module';
import { TimersModule } from './timers/timers.module';
import { MainItemModule } from './components/main-item/main-item.module';
import { CommonModule } from '@angular/common';
import { SvgModule } from './components/svg/svg.module';

@NgModule({
	declarations: [
		SortTrendingPipe,
		SortPointsPipe,
		CheckEditablePointsPipe,
		ColorsCheckPipe,
		FilterPipe,
		AppComponent,
		MainListComponent,
		HeaderComponent,
		FooterComponent,
		PrivacyComponent,
		DatePointsPopupComponent,
		SettingsComponent,
	],
	imports: [
		CommonModule,
		BoardModule,
		TimersModule,
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		FormsModule,
		HttpClientModule,
		SharedModule,
		SvgModule,
		ClockModule,
		MainItemModule,
	],
	providers: [
		provideAnimations(),
		{
			provide: APP_INITIALIZER,
			useFactory: FontProvider,
			multi: true,
		},
		provideFirebaseApp(() =>
			initializeApp({
				projectId: 'countdown-2971d',
				appId: '1:711051586210:web:f9be0c6579bbb2608d85fb',
				databaseURL: 'https://countdown-2971d-default-rtdb.firebaseio.com',
				storageBucket: 'countdown-2971d.appspot.com',
				apiKey: 'AIzaSyAqSOHSqWdyzx2GKWK33AqIIRgimEjVFak',
				authDomain: 'countdown-2971d.firebaseapp.com',
				messagingSenderId: '711051586210',
				measurementId: 'G-XRDWYMHR2Y',
			}),
		),
		provideAuth(() => getAuth()),
		provideDatabase(() => getDatabase()),
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
