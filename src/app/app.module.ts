import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainListComponent } from './components/main-list/main-list.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { SharedModule } from './shared.module';
import { SortPointsPipe } from './pipes/sort-points.pipe';
import { CheckEditablePointsPipe } from './pipes/check-editable-points.pipe';
import { ColorsCheckPipe } from './pipes/colors-check.pipe';
import { SortTrendingPipe } from './pipes/sort-trending.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { DatePointsPopupComponent } from './components/date-points-popup/date-points-popup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ClockModule } from './components/clock/clock.module';
import { BoardModule } from './components/board/board.module';
import { TimersModule } from './timers/timers.module';
import { CommonModule } from '@angular/common';
import { SvgModule } from './components/svg/svg.module';
import { LinkPointComponent } from './components/link-point/link-point.component';
import { QrCodeModule } from 'ng-qrcode';
import { MainItemModule } from './components/main-item/main-item.module';
import { DonateComponent } from './components/donate/donate.component';

@NgModule({
	declarations: [
		SortTrendingPipe,
		SortPointsPipe,
		CheckEditablePointsPipe,
		ColorsCheckPipe,
		FilterPipe,
		MainListComponent,
		HeaderComponent,
		FooterComponent,
		PrivacyComponent,
		DatePointsPopupComponent,
		SettingsComponent,
		LinkPointComponent,
		DonateComponent,
	],
	imports: [
		RouterModule,
		CommonModule,
		BoardModule,
		TimersModule,
		FormsModule,
		SharedModule,
		SvgModule,
		ClockModule,
		MainItemModule,
		QrCodeModule,
	],
	exports: [
		RouterModule,
		SharedModule,
		HeaderComponent,
		FooterComponent,
		MainListComponent,
		SortTrendingPipe,
		SortPointsPipe,
		CheckEditablePointsPipe,
		ColorsCheckPipe,
		FilterPipe,
		PrivacyComponent,
		DatePointsPopupComponent,
		SettingsComponent,
		LinkPointComponent,
		DonateComponent,
		BoardModule,
		TimersModule,
		ClockModule,
		MainItemModule,
		SvgModule,
		QrCodeModule,
	],
})
export class AppModule {}
