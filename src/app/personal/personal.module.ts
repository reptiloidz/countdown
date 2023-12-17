import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNgxMask } from 'ngx-mask';
import { AuthComponent } from './components/auth/auth.component';
import { RegComponent } from './components/reg/reg.component';
import { authGuard } from '../services/auth.guard';

@NgModule({
	declarations: [AuthComponent, RegComponent],
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
		]),
	],
	exports: [RouterModule],
	providers: [
		// { provide: HttpService, useClass: MockHttpService },
		[provideNgxMask()],
	],
})
export class PersonalModule {}
