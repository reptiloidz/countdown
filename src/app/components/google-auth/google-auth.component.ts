import { Component } from '@angular/core';
import { AuthService, NotifyService, PopupService } from 'src/app/services';
import { PrivacyComponent } from '../privacy/privacy.component';

@Component({
	selector: 'app-google-auth',
	templateUrl: './google-auth.component.html',
})
export class GoogleAuthComponent {
	acceptedPrivacy = false;

	constructor(
		private auth: AuthService,
		private notify: NotifyService,
		private popupService: PopupService,
	) {}

	authGoogle() {
		this.auth
			.login({
				google: true,
			})
			.catch(err => {
				this.notify.add({
					title: 'Ошибка при авторизации через Google',
					view: 'negative',
				});
				console.error('Ошибка при авторизации через Google:\n', err.message);
			});
	}

	showPrivacy() {
		this.popupService.show('Политика в отношении обработки персональных данных', PrivacyComponent);
	}
}
