import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounce, distinctUntilChanged, Subscription, tap, timer } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { NotifyService } from 'src/app/services/notify.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
	constructor(private auth: AuthService, private notify: NotifyService) {}

	formData!: FormGroup;
	formEmail!: FormGroup;
	formPassword!: FormGroup;
	userpic = '';
	name = '';
	userpicLoading = false;
	private user!: User;
	private _debounceTime = 1000;
	private subscriptions = new Subscription();

	ngOnInit(): void {
		this.formData = new FormGroup({
			name: new FormControl(null, [Validators.required]),
		});

		this.formEmail = new FormGroup({
			email: new FormControl(null, [
				Validators.required,
				Validators.pattern(
					'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
				),
			]),
		});

		this.formPassword = new FormGroup({
			password: new FormControl(null, [
				Validators.required,
				Validators.minLength(8),
			]),
			'new-password': new FormControl(null, [
				Validators.required,
				Validators.minLength(8),
			]),
		});

		this.subscriptions.add(
			this.auth.currentUser.subscribe({
				next: (data) => {
					this.user = data as User;
					this.formEmail.controls['email'].setValue(data?.email);
					this.formData.controls['name'].setValue(data?.displayName);
					this.userpic = data?.photoURL as string;
				},
			})
		);

		this.subscriptions.add(
			this.auth.eventProfileUpdated$
				.pipe(distinctUntilChanged())
				.subscribe({
					next: (data) => {
						this.notify.add({
							title: `Данные пользователя ${data?.displayName} (${this.user?.email}) обновлены.`,
						});
					},
				})
		);

		this.subscriptions.add(
			this.auth.eventEmailUpdated$
				.pipe(distinctUntilChanged())
				.subscribe({
					next: () => {
						this.auth.verifyEmail();
					},
				})
		);

		this.subscriptions.add(
			this.auth.eventPasswordUpdated$
				.pipe(distinctUntilChanged())
				.subscribe({
					next: () => {
						this.notify.add({
							title: `Пароль пользователя ${this.user?.displayName} (${this.user?.email}) обновлён.`,
						});

						this.formPassword.controls['password'].setValue(null);
						this.formPassword.controls['new-password'].setValue(
							null
						);
					},
				})
		);

		this.subscriptions.add(
			this.formData.controls['name'].valueChanges
				.pipe(
					tap(() => {
						this.userpicLoading = true;
					})
				)
				.pipe(debounce(() => timer(this._debounceTime)))
				.subscribe({
					next: (data) => {
						this.name = data;
						this.userpic = `https://ui-avatars.com/api/?name=${this.generateUserpicUrl(
							data
						)}&background=random`;
						this.userpicLoading = false;
					},
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	updateProfile() {
		this.auth.updateProfile(this.user, {
			displayName: this.formData.controls['name'].value,
			photoURL: this.userpic,
		});
	}

	updateEmail() {
		this.auth.updateEmail(
			this.user,
			this.formEmail.controls['email'].value
		);
	}

	updatePassword() {
		this.auth.updatePassword(
			this.user,
			this.formPassword.controls['new-password'].value
		);
	}

	generateUserpicUrl(name: string) {
		return name.replaceAll(' ', '+');
	}
}
