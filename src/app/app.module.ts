import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainListComponent } from './components/main-list/main-list.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SharedModule } from './shared.module';
import { SortPointsPipe } from './pipes/sort-points.pipe';
import { ClockModule } from './components/clock/clock.module';
import { BoardModule } from './components/board/board.module';
import { TimersModule } from './timers/timers.module';
import { CommonModule } from '@angular/common';
import { SvgModule } from './components/svg/svg.module';
import { QrCodeModule } from 'ng-qrcode';
import { MainItemModule } from './components/main-item/main-item.module';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { DatePointsPopupComponent } from './components/date-points-popup/date-points-popup.component';
import { LinkPointComponent } from './components/link-point/link-point.component';
import { DonateComponent } from './components/donate/donate.component';

@NgModule({
	declarations: [SortPointsPipe],
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
		HeaderComponent,
		FooterComponent,
		MainListComponent,
		PrivacyComponent,
		DatePointsPopupComponent,
		LinkPointComponent,
		DonateComponent,
	],
	providers: [SortPointsPipe],
	exports: [
		RouterModule,
		SharedModule,
		HeaderComponent,
		FooterComponent,
		MainListComponent,
		SortPointsPipe,
		PrivacyComponent,
		DatePointsPopupComponent,
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
