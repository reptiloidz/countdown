import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { AuthComponent } from './components/auth/auth.component';
import { RegComponent } from './components/reg/reg.component';
import { authGuard, leaveUrlGuard, unauthGuard } from '../../guards';
import { ProfileComponent } from './components/profile/profile.component';
import { SharedModule } from '../../shared.module';
import { noPointGuard } from 'src/app/guards/noPoint.guard';
import { GoogleAuthComponent } from 'src/app/components/google-auth/google-auth.component';

@NgModule({
	declarations: [AuthComponent, RegComponent, ProfileComponent, GoogleAuthComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		RouterModule.forChild([
			{
				path: 'auth',
				component: AuthComponent,
				canActivate: [leaveUrlGuard, noPointGuard, authGuard],
				data: { state: 'auth' },
			},
			{
				path: 'reg',
				component: RegComponent,
				canActivate: [leaveUrlGuard, authGuard],
				data: { state: 'reg' },
			},
			{
				path: 'profile',
				component: ProfileComponent,
				canActivate: [unauthGuard],
				data: { state: 'profile' },
			},
		]),
	],
	exports: [RouterModule],
	providers: [
		// { provide: HttpService, useClass: MockHttpService },
		[provideNgxMask()],
	],
})
export class PersonalModule {}
