import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { format, parse } from 'date-fns';
import {
	debounce,
	distinctUntilChanged,
	Subscription,
	concatMap,
	switchMap,
	tap,
	timer,
} from 'rxjs';
import { Constants } from 'src/app/enums';
import { getErrorMessages } from 'src/app/helpers/getErrorMessages';
import { mergeDeep } from 'src/app/helpers/mergeDeep';
import { ValidationObject } from 'src/app/interfaces/validation.interface';
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
	userpicLoading = true;
	profileLoading = true;
	emailLoading = true;
	passwordLoading = false;
	removeLoading = false;
	private _user!: User;
	private _birthDate = '';
	private _birthDatePointId = '';
	private _debounceTime = 1000;
	private subscriptions = new Subscription();

	nameValidated: ValidationObject = {
		name: {
			required: {
				value: false,
				message: 'Вы не ввели имя пользователя',
			},
			dirty: false,
		},
	};
	nameErrorMessages: string[] = [];

	emailValidated: ValidationObject = {
		email: {
			required: {
				value: false,
				message: 'Вы не ввели почту',
			},
			correct: {
				value: false,
				message: 'Вы ввели почту неверно',
			},
			dirty: false,
		},
	};
	emailErrorMessages: string[] = [];

	passwordValidated: ValidationObject = {
		password: {
			required: {
				value: false,
				message: 'Вы не ввели пароль',
			},
			dirty: false,
		},
		passwordNew: {
			required: {
				value: false,
				message: 'Вы не ввели новый пароль',
			},
			enough: {
				value: false,
				message: 'Новый пароль слишком короткий',
			},
			dirty: false,
		},
	};
	passwordErrorMessages: string[] = [];

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
			this.auth.currentUser
				.pipe(
					tap((data) => {
						this.emailLoading = false;
						this._user = data as User;
					}),
					switchMap(() => {
						return this.auth.eventProfileUpdated$;
					}),
					tap(() => {
						this.profileLoading = false;
						this.formEmail.controls['email'].setValue(
							this._user?.email
						);
						this.formData.controls['name'].setValue(
							this._user?.displayName
						);
						this.userpic = this._user?.photoURL as string;
					}),
					concatMap(() => {
						return this.auth.getUserData(this._user.uid);
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
			this.auth.eventBirthDateAdded$
				.pipe(
					concatMap(() => {
						return this.auth.eventProfileUpdated$;
					})
				)
				.pipe(distinctUntilChanged())
				.subscribe({
					next: (data) => {
						data?.displayName &&
							this.notify.add({
								title: `Данные пользователя ${data.displayName} (${this._user?.email}) обновлены.`,
							});
					},
				})
		);

		this.subscriptions.add(
			this.auth.eventEmailUpdated$
				.pipe(distinctUntilChanged())
				.subscribe({
					next: () => {
						this.emailLoading = false;
						this.auth.verifyEmail();
					},
				})
		);

		this.subscriptions.add(
			this.auth.eventPasswordUpdated$.subscribe({
				next: (passwordError) => {
					this.passwordLoading = false;
					if (!passwordError) {
						this.notify.add({
							title: `Пароль пользователя ${this._user?.displayName} (${this._user?.email}) обновлён.`,
						});

						this.formPassword.controls['password'].setValue(null);
						this.formPassword.controls['new-password'].setValue(
							null
						);
						this.passwordErrorMessages = [];
					}
				},
			})
		);

		this.subscriptions.add(
			this.auth.eventAccountDeleted$.subscribe({
				next: () => {
					this.auth.logout();

					this._birthDatePointId = '';
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

						this.nameValidated = mergeDeep(this.nameValidated, {
							name: {
								required: {
									value: !this.formData.controls['name']
										.errors?.['required'],
								},
								dirty: this.formData.controls['name'].dirty,
							},
						}) as ValidationObject;
						this.nameErrorMessages = getErrorMessages(
							this.nameValidated
						);
					},
				})
		);

		this.subscriptions.add(
			this.formEmail.controls['email'].valueChanges.subscribe({
				next: () => {
					this.emailValidated = mergeDeep(this.emailValidated, {
						email: {
							correct: {
								value: !this.formEmail.controls['email']
									.errors?.['pattern'],
							},
							required: {
								value: !this.formEmail.controls['email']
									.errors?.['required'],
							},
							dirty: this.formEmail.controls['email'].dirty,
						},
					}) as ValidationObject;
					this.emailErrorMessages = getErrorMessages(
						this.emailValidated
					);
				},
			})
		);

		this.subscriptions.add(
			this.formPassword.valueChanges.subscribe({
				next: () => {
					this.passwordValidated = mergeDeep(this.passwordValidated, {
						password: {
							required: {
								value: !this.formPassword.controls['password']
									.errors?.['required'],
							},
							dirty: this.formPassword.controls['password'].dirty,
						},
						passwordNew: {
							required: {
								value: !this.formPassword.controls[
									'new-password'
								].errors?.['required'],
							},
							enough: {
								value: !(
									this.formPassword.controls['new-password']
										.errors?.['minlength']?.actualLength <
									this.formPassword.controls['new-password']
										.errors?.['minlength']?.requiredLength
								),
							},
							dirty: this.formPassword.controls['new-password']
								.dirty,
						},
					}) as ValidationObject;
					this.passwordErrorMessages = getErrorMessages(
						this.passwordValidated
					);
				},
			})
		);

		this.subscriptions.add(
			// Рассчитываем, что на этой странице создаётся только событие ДР и выводим ссылку на него
			this.data.eventAddPoint$.subscribe({
				next: (point) => {
					this.auth
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
		this.profileLoading = true;
		this.auth.updateProfile(this._user, {
			displayName: this.formData.controls['name'].value,
			photoURL: this.userpic,
		});
	}

	updateProfile() {
		this.updateNameAndPhoto();
		const bdValue = this.formData.controls['birthDate'].value;
		const bdFinalValue = bdValue
			? format(
					parse(
						'00:00',
						Constants.timeFormat,
						parse(bdValue, Constants.shortDateFormat, new Date())
					),
					Constants.fullDateFormat
			  )
			: '';

		if (bdFinalValue == this._birthDate) {
			this.auth.eventBirthDateAdded();
		} else {
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
			this.auth.updateUserBirthDate(this._user.uid, {
				birthDate: bdFinalValue,
				birthDatePointId: this._birthDatePointId || '',
			});
		}
	}

	updateEmail() {
		this.emailLoading = true;
		this.auth.updateEmail(
			this._user,
			this.formEmail.controls['email'].value
		);
	}

	updatePassword() {
		this.passwordLoading = true;
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
			(this.removeLoading = true) &&
			this.auth.removeAccount(this._user, this._birthDatePointId);
	}
}
