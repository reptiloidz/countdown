import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { AuthComponent } from './components/auth/auth.component';
import { RegComponent } from './components/reg/reg.component';
import { authGuard } from '../services/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { unauthGuard } from '../services/unauth.guard';

@NgModule({
	declarations: [AuthComponent, RegComponent, ProfileComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild([
			{
				path: 'auth',
				component: AuthComponent,
			},
			{
				path: 'reg',
				component: RegComponent,
				canActivate: [authGuard],
			},
			{
				path: 'profile',
				component: ProfileComponent,
				canActivate: [unauthGuard],
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
