import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { format, parse } from 'date-fns';
import {
	debounce,
	distinctUntilChanged,
	EMPTY,
	Subscription,
	switchMap,
	tap,
	timer,
} from 'rxjs';
import { Constants } from 'src/app/enums';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { HttpService } from 'src/app/services/http.service';
import { NotifyService } from 'src/app/services/notify.service';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
	constructor(
		private auth: AuthService,
		private http: HttpService,
		private data: DataService,
		private notify: NotifyService
	) {}

	birthDateEventName = 'Я родился';

	formData!: FormGroup;
	formEmail!: FormGroup;
	formPassword!: FormGroup;
	userpic = '';
	name = '';
	userpicLoading = false;
	private _user!: User;
	private _birthDate = '';
	private _birthDatePointId = '';
	private _debounceTime = 1000;
	private subscriptions = new Subscription();

	ngOnInit(): void {
		this.formData = new FormGroup({
			name: new FormControl(null, [Validators.required]),
			birthDate: new FormControl(null),
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
			this.auth.eventProfileUpdated$
				.pipe(switchMap(() => this.auth.currentUser))
				.pipe(
					tap((data) => {
						this._user = data as User;
						this.formEmail.controls['email'].setValue(data?.email);
						this.formData.controls['name'].setValue(
							data?.displayName
						);
						this.userpic = data?.photoURL as string;
					})
				)
				.pipe(
					switchMap((data) => {
						return data ? this.http.getUserData(data.uid) : EMPTY;
					})
				)
				.subscribe({
					next: (user) => {
						user?.birthDatePointId &&
							(this._birthDatePointId = user.birthDatePointId);
						this._birthDate = user?.birthDate || '';

						this.formData.controls['birthDate'].setValue(
							user?.birthDate
								? format(
										parse(
											'00:00',
											Constants.timeFormat,
											parse(
												user.birthDate,
												Constants.fullDateFormat,
												new Date()
											)
										),
										Constants.shortDateFormat
								  )
								: ''
						);
					},
				})
		);

		this.subscriptions.add(
			this.http.eventBirthDateAdded$
				.pipe(
					switchMap(() => {
						return this.auth.eventProfileUpdated$;
					})
				)
				.pipe(distinctUntilChanged())
				.subscribe({
					next: (data) => {
						this.notify.add({
							title: `Данные пользователя ${data?.displayName} (${this._user?.email}) обновлены.`,
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
			this.auth.eventPasswordUpdated$.subscribe({
				next: () => {
					this.notify.add({
						title: `Пароль пользователя ${this._user?.displayName} (${this._user?.email}) обновлён.`,
					});

					this.formPassword.controls['password'].setValue(null);
					this.formPassword.controls['new-password'].setValue(null);
				},
			})
		);

		this.subscriptions.add(
			this.auth.eventAccountDeleted$.subscribe({
				next: () => {
					this.auth.logout();

					this.notify.add({
						title: `Учётная запись ${this._user?.displayName} (${this._user?.email}) удалена.`,
					});
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

		this.subscriptions.add(
			// Рассчитываем, что на этой странице создаётся только событие ДР и выводим ссылку на него
			this.data.eventAddPoint$.subscribe({
				next: (point) => {
					this.http
						.updateUserBirthDate(this._user.uid, {
							birthDate: this._birthDate,
							birthDatePointId: point.id,
						})
						.then(() => {
							this.notify.add({
								title: `Создано событие "<a href="../point/${point.id}">${this.birthDateEventName}</a>"`,
							});
						});
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	updateNameAndPhoto() {
		this.auth.updateProfile(this._user, {
			displayName: this.formData.controls['name'].value,
			photoURL: this.userpic,
		});
	}

	updateProfile() {
		this.updateNameAndPhoto();
		const bdValue = this.formData.controls['birthDate'].value;

		if (bdValue == this._birthDate) {
			this.http.eventBirthDateAdded();
		} else {
			const bdFinalValue = bdValue
				? format(
						parse(
							'00:00',
							Constants.timeFormat,
							parse(
								bdValue,
								Constants.shortDateFormat,
								new Date()
							)
						),
						Constants.fullDateFormat
				  )
				: '';

			if (!this._birthDatePointId && bdFinalValue) {
				this.data.addPoint({
					dates: [
						{
							date: bdFinalValue,
							reason: 'byHand',
						},
					],
					title: this.birthDateEventName,
					direction: 'forward',
					greenwich: false,
					repeatable: false,
					public: false,
					user: this._user.uid,
				});
			}

			this.http.updateUserBirthDate(this._user.uid, {
				birthDate: bdFinalValue,
				birthDatePointId: '',
			});
		}
	}

	updateEmail() {
		this.auth.updateEmail(
			this._user,
			this.formEmail.controls['email'].value
		);
	}

	updatePassword() {
		this.auth.updatePassword(
			this._user,
			this.formPassword.controls['password'].value,
			this.formPassword.controls['new-password'].value
		);
	}

	generateUserpicUrl(name: string) {
		return name?.replaceAll(' ', '+');
	}

	removeAccount() {
		confirm('Точно удалить учётную запись? Действие необратимо!') &&
			this.auth.removeAccount(this._user, this._birthDatePointId);
	}
}
