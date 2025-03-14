import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainListComponent } from './components/main-list/main-list.component';
import { MainItemComponent } from './components/main-item/main-item.component';
import { PointComponent } from './components/point/point.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EditPointComponent } from './components/edit-point/edit-point.component';
import { HttpClientModule } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SharedModule } from './shared/shared.module';
import { CheckCopiesPipe } from './pipes/check-copies.pipe';
import { CheckAccessEditPipe } from './pipes/check-access-edit.pipe';
import { SortPointsPipe } from './pipes/sort-points.pipe';
import { CheckEditablePointsPipe } from './pipes/check-editable-points.pipe';
import { ColorsCheckPipe } from './pipes/colors-check.pipe';
import { SortTrendingPipe } from './pipes/sort-trending.pipe';
import { ClockComponent } from './components/clock/clock.component';
import { PanelComponent } from './components/panel/panel.component';
import { BoardComponent } from './components/board/board.component';
import { FontProvider } from './providers/font.provider';
import { TimeRemainTextPipe } from './pipes/time-remain-text.pipe';
import { TimeRemainPipe } from './pipes/time-remain.pipe';
import { DatePanelComponent } from './components/date-panel/date-panel.component';
import { FilterPipe } from './pipes/filter.pipe';
import { SortKeyValuePipe } from './pipes/sortKeyValue.pipe';
import { TimersComponent } from './components/timers/timers.component';
import { NoPageComponent } from './components/no-page/no-page.component';
import { PointModesComponent } from './components/point-modes/point-modes.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DatePointsPopupComponent } from './components/date-points-popup/date-points-popup.component';
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
	declarations: [
		SortTrendingPipe,
		CheckCopiesPipe,
		CheckAccessEditPipe,
		SortPointsPipe,
		CheckEditablePointsPipe,
		ColorsCheckPipe,
		TimeRemainTextPipe,
		TimeRemainPipe,
		SortKeyValuePipe,
		FilterPipe,
		AppComponent,
		MainListComponent,
		MainItemComponent,
		PointComponent,
		HeaderComponent,
		FooterComponent,
		EditPointComponent,
		PrivacyComponent,
		ClockComponent,
		PanelComponent,
		BoardComponent,
		DatePanelComponent,
		TimersComponent,
		NoPageComponent,
		PointModesComponent,
		DatePointsPopupComponent,
		SettingsComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		SharedModule,
		ScrollingModule,
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
	providers: [
		provideAnimations(),
		{
			provide: APP_INITIALIZER,
			useFactory: FontProvider,
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
