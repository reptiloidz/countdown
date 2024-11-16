import {
	Component,
	HostBinding,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { format, parse, subYears } from 'date-fns';
import {
	debounce,
	distinctUntilChanged,
	Subscription,
	concatMap,
	switchMap,
	tap,
	timer,
	skipWhile,
} from 'rxjs';
import { InputComponent } from 'src/app/components/input/input.component';
import { Constants } from 'src/app/enums';
import {
	generateUserpicName,
	getErrorMessages,
	mergeDeep,
	parseDate,
	randomHEXColor,
} from 'src/app/helpers';
import { ValidationObject } from 'src/app/interfaces';
import { AuthService, DataService, NotifyService } from 'src/app/services';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
	@ViewChild('passwordControl') private passwordControl!: InputComponent;
	@ViewChild('passwordRepeatControl') passwordRepeatControl!: InputComponent;
	@HostBinding('class') class = 'main__inner';

	constructor(
		private auth: AuthService,
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
	verifyButtonDisabled = false;
	birthDatePickerValue!: Date;
	disabledAfter = subYears(new Date(), 1);
	private _user!: User;
	private _birthDate = '';
	private _birthDatePointId = '';
	private _debounceTime = 1000;
	private _profileChanged = false;
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
			same: {
				value: false,
				message: 'Новый пароль совпадает со старым',
			},
			dirty: false,
		},
	};
	passwordErrorMessages: string[] = [];
	oldPasswordErrorMessages: string[] = [];
	newPasswordErrorMessages: string[] = [];

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
						this.name = this._user?.displayName as string;
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

						if (user?.birthDate) {
							this.birthDatePickerValue = parse(
								'00:00',
								Constants.timeFormat,
								parseDate(user.birthDate)
							);
						}
					},
				})
		);

		this.subscriptions.add(
			this.auth.eventBirthDateAdded$
				.pipe(
					concatMap(() => {
						return this.auth.eventProfileUpdated$;
					}),
					skipWhile(() => {
						const isSkipped = !this._profileChanged;
						this._profileChanged = true;
						return isSkipped;
					}),
					distinctUntilChanged()
				)
				.subscribe({
					next: (data) => {
						data?.displayName &&
							this.notify.add({
								title: `Данные пользователя ${data.displayName} (${this._user?.email}) обновлены.`,
								short: true,
								view: 'positive',
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
						this.auth.verifyEmail(this._user);
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
							short: true,
							view: 'positive',
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
						short: true,
						view: 'positive',
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
						if (this.name !== data) {
							this.name = data;
							this.userpic = `https://ui-avatars.com/api/?name=${generateUserpicName(
								data
							)}&background=${randomHEXColor()}`;
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
						}
						this.userpicLoading = false;
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
							same: {
								value: !(
									this.formPassword.controls['password']
										.value ===
										this.formPassword.controls[
											'new-password'
										].value &&
									this.formPassword.controls['password'].value
								),
							},
							dirty: this.formPassword.controls['new-password']
								.dirty,
						},
					}) as ValidationObject;

					const oldPasswordValidated = {
						password: this.passwordValidated['password'],
					};
					const newPasswordValidated = {
						passwordNew: this.passwordValidated['passwordNew'],
					};
					this.passwordErrorMessages = getErrorMessages(
						this.passwordValidated
					);
					this.oldPasswordErrorMessages =
						getErrorMessages(oldPasswordValidated);
					this.newPasswordErrorMessages =
						getErrorMessages(newPasswordValidated);
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
								title: `Создано событие "<a href="../point/${point.id}" class="notify-list__link">${this.birthDateEventName}</a>"`,
								autoremove: true,
								view: 'positive',
							});
						});
				},
			})
		);

		this.subscriptions.add(
			this.auth.eventVerifyEmailSent$.subscribe({
				next: () => {
					this.verifyButtonDisabled = false;
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get emailVerified(): boolean {
		return this._user?.emailVerified;
	}

	get isSameEmail(): boolean {
		return this._user.email === this.formEmail.controls['email'].value;
	}

	birthDatePicked(date: Date) {
		this.birthDatePickerValue = date;
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
		if (!this.birthDatePickerValue) {
			return;
		}
		const bdFinalValue = format(
			this.birthDatePickerValue,
			Constants.fullDateFormat
		);

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
					color: 'yellow',
				});
			}
			this.auth.updateUserBirthDate(this._user.uid, {
				birthDate: bdFinalValue,
				birthDatePointId: this._birthDatePointId || '',
			});
		}
	}

	sendEmailVerification() {
		this.auth.verifyEmail(this._user);
		this.verifyButtonDisabled = true;
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

	removeAccount() {
		this.notify
			.confirm({
				title: 'Точно удалить учётную запись? Действие необратимо!',
			})
			.subscribe({
				next: () => {
					this.removeLoading = true;
					this.auth.removeAccount(this._user, this._birthDatePointId);
				},
				complete: () => {
					this.removeLoading = false;
				},
			});
	}
}
