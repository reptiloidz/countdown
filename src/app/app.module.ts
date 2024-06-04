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
import { HttpService } from './services';
import { HttpService as MockHttpService } from './services/http.mock.service';
import { GenerateIterationsComponent } from './components/generate-iterations/generate-iterations.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { PopupComponent } from './components/popup/popup.component';
import { FilterPipe } from './pipes/filter.pipe';
import { SharedModule } from './shared/shared.module';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { CheckCopiesPipe } from './pipes/check-copies.pipe';
import { CheckAccessEditPipe } from './pipes/check-access-edit.pipe';
import { SortPointsPipe } from './pipes/sort-points.pipe';
import { CheckEditablePointsPipe } from './pipes/check-editable-points.pipe';
import { ColorsCheckPipe } from './pipes/colors-check.pipe';
import { SortTrendingPipe } from './pipes/sort-trending.pipe';
import { ClockComponent } from './components/clock/clock.component';
import { PanelComponent } from './components/panel/panel.component';
import { BoardComponent } from './components/board/board.component';

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
		PrivacyComponent,
		PopupComponent,
		FilterPipe,
		TooltipComponent,
		CheckCopiesPipe,
		CheckAccessEditPipe,
		SortPointsPipe,
		SortTrendingPipe,
		CheckEditablePointsPipe,
		ColorsCheckPipe,
		ClockComponent,
		PanelComponent,
		BoardComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		SharedModule,
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
		provideDatabase(() => getDatabase()),
	],
	providers: [[provideNgxMask()], SortTrendingPipe],
	bootstrap: [AppComponent],
})
export class AppModule {}
