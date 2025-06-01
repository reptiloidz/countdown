import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
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
	filter,
} from 'rxjs';
import { InputComponent } from 'src/app/components/input/input.component';
import { LinkPointComponent } from 'src/app/components/link-point/link-point.component';
import { Constants } from 'src/app/enums';
import { generateUserpicName, getErrorMessages, mergeDeep, parseDate, randomHEXColor } from 'src/app/helpers';
import { ValidationObject } from 'src/app/interfaces';
import { AuthService, DataService, NotifyService } from 'src/app/services';
import {
	setEmailLoading,
	setPasswordLoading,
	setProfileLoading,
	setRemoveLoading,
	setUnlinkLoading,
	setUserpicLoading,
} from 'src/app/store/actions/loading.action';
import { AppState } from 'src/app/store/reducers';
import {
	selectEmailLoading,
	selectPasswordLoading,
	selectProfileLoading,
	selectRemoveLoading,
	selectUnlinkLoading,
	selectUserpicLoading,
} from 'src/app/store/selectors/loading.selector';

const DEFAULT_PASSWORD_VALIDATION: ValidationObject = {
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

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
	@ViewChild('passwordControl') private passwordControl!: InputComponent;
	@ViewChild('passwordRepeatControl') passwordRepeatControl!: InputComponent;
	@HostBinding('class') class = 'main__inner';

	constructor(
		private auth: AuthService,
		private data: DataService,
		private notify: NotifyService,
		private cdr: ChangeDetectorRef,
		private store: Store<AppState>,
	) {}

	birthDateEventName = 'Я родился';

	formData!: FormGroup;
	formEmail!: FormGroup;
	formPassword!: FormGroup;
	userpic = '';
	name = '';
	verifyButtonDisabled = false;
	birthDatePickerValue!: Date;
	disabledAfter = subYears(new Date(), 1);
	timestamp = +new Date();
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

	passwordValidated: ValidationObject = DEFAULT_PASSWORD_VALIDATION;
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
				Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'),
			]),
		});

		this.formPassword = new FormGroup({
			password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
			'new-password': new FormControl(null, [Validators.required, Validators.minLength(8)]),
		});

		this.subscriptions.add(
			this.auth.currentUser
				.pipe(
					tap(data => {
						this.store.dispatch(setEmailLoading({ emailLoading: false }));
						this._user = data as User;
					}),
					switchMap(() => {
						return this.auth.eventProfileUpdated$;
					}),
					tap(() => {
						this.store.dispatch(setProfileLoading({ profileLoading: false }));
						this.formEmail.controls['email'].setValue(this._user?.email);
						this.formData.controls['name'].setValue(this._user?.displayName);
						this.name = this._user?.displayName as string;
						this.userpic = this._user?.photoURL as string;
					}),
					concatMap(() => {
						return this.auth.getUserData(this._user.uid);
					}),
				)
				.subscribe({
					next: user => {
						user?.birthDatePointId && (this._birthDatePointId = user.birthDatePointId);
						this._birthDate = user?.birthDate || '';

						if (user?.birthDate) {
							this.birthDatePickerValue = parse('00:00', Constants.timeFormat, parseDate(user.birthDate));
						}
						this.cdr.markForCheck();
					},
					error: () => {
						this.store.dispatch(setProfileLoading({ profileLoading: false }));
						this.store.dispatch(setEmailLoading({ emailLoading: false }));
						this.cdr.detectChanges();
					},
					complete: () => {
						this.store.dispatch(setProfileLoading({ profileLoading: false }));
						this.store.dispatch(setEmailLoading({ emailLoading: false }));
						this.cdr.detectChanges();
					},
				}),
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
					distinctUntilChanged(),
				)
				.subscribe({
					next: data => {
						data?.displayName &&
							this.notify.add({
								title: `Данные пользователя ${data.displayName} (${this._user?.email}) обновлены.`,
								short: true,
								view: 'positive',
							});
						this.cdr.markForCheck();
					},
				}),
		);

		this.subscriptions.add(
			this.auth.eventEmailUpdated$.pipe(distinctUntilChanged()).subscribe({
				next: () => {
					this.store.dispatch(setEmailLoading({ emailLoading: false }));
					this.auth.verifyEmail(this._user);
					this.cdr.detectChanges();
				},
				error: () => {
					this.store.dispatch(setEmailLoading({ emailLoading: false }));
					this.cdr.detectChanges();
				},
				complete: () => {
					this.store.dispatch(setEmailLoading({ emailLoading: false }));
					this.cdr.detectChanges();
				},
			}),
		);

		this.subscriptions.add(
			this.auth.eventPasswordUpdated$.subscribe({
				next: passwordError => {
					this.store.dispatch(setPasswordLoading({ passwordLoading: false }));
					if (!passwordError) {
						this.notify.add({
							title: `Пароль пользователя ${this._user?.displayName} (${this._user?.email}) обновлён.`,
							short: true,
							view: 'positive',
						});

						this.formPassword.reset();
						this.formPassword.controls['password'].setValue('');
						this.formPassword.controls['new-password'].setValue('');
						this.passwordErrorMessages = [];
						this.passwordValidated = DEFAULT_PASSWORD_VALIDATION;
					}
					this.cdr.detectChanges();
				},
				error: () => {
					this.store.dispatch(setPasswordLoading({ passwordLoading: false }));
					this.cdr.detectChanges();
				},
				complete: () => {
					this.store.dispatch(setPasswordLoading({ passwordLoading: false }));
					this.cdr.detectChanges();
				},
			}),
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
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.formData.controls['name'].valueChanges
				.pipe(
					tap(() => {
						this.store.dispatch(setUserpicLoading({ userpicLoading: !this.isGoogle }));
					}),
					filter(() => !this.isGoogle),
				)
				.pipe(debounce(() => timer(this._debounceTime)))
				.subscribe({
					next: data => {
						if (this.name !== data) {
							this.name = data;
							this.userpic = `https://ui-avatars.com/api/?name=${generateUserpicName(
								data,
							)}&background=${randomHEXColor()}`;
							this.nameValidated = mergeDeep(this.nameValidated, {
								name: {
									required: {
										value: !this.formData.controls['name'].errors?.['required'],
									},
									dirty: this.formData.controls['name'].dirty,
								},
							}) as ValidationObject;
							this.nameErrorMessages = getErrorMessages(this.nameValidated);
						}
						this.store.dispatch(setUserpicLoading({ userpicLoading: false }));
						this.cdr.detectChanges();
					},
					error: () => {
						this.store.dispatch(setUserpicLoading({ userpicLoading: false }));
						this.cdr.detectChanges();
					},
					complete: () => {
						this.store.dispatch(setUserpicLoading({ userpicLoading: false }));
						this.cdr.detectChanges();
					},
				}),
		);

		this.subscriptions.add(
			this.formEmail.controls['email'].valueChanges.subscribe({
				next: () => {
					this.emailValidated = mergeDeep(this.emailValidated, {
						email: {
							correct: {
								value: !this.formEmail.controls['email'].errors?.['pattern'],
							},
							required: {
								value: !this.formEmail.controls['email'].errors?.['required'],
							},
							dirty: this.formEmail.controls['email'].dirty,
						},
					}) as ValidationObject;
					this.emailErrorMessages = getErrorMessages(this.emailValidated);
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.formPassword.valueChanges.subscribe({
				next: () => {
					if (!this.formPassword.dirty) {
						return;
					}
					this.passwordValidated = mergeDeep(this.passwordValidated, {
						password: {
							required: {
								value: !this.formPassword.controls['password'].errors?.['required'],
							},
							dirty: this.formPassword.controls['password'].dirty,
						},
						passwordNew: {
							required: {
								value: !this.formPassword.controls['new-password'].errors?.['required'],
							},
							enough: {
								value: !(
									this.formPassword.controls['new-password'].errors?.['minlength']?.actualLength <
									this.formPassword.controls['new-password'].errors?.['minlength']?.requiredLength
								),
							},
							same: {
								value: !(
									this.formPassword.controls['password'].value === this.formPassword.controls['new-password'].value &&
									this.formPassword.controls['password'].value
								),
							},
							dirty: this.formPassword.controls['new-password'].dirty,
						},
					}) as ValidationObject;

					const oldPasswordValidated = {
						password: this.passwordValidated['password'],
					};
					const newPasswordValidated = {
						passwordNew: this.passwordValidated['passwordNew'],
					};
					this.passwordErrorMessages = getErrorMessages(this.passwordValidated);
					this.oldPasswordErrorMessages = getErrorMessages(oldPasswordValidated);
					this.newPasswordErrorMessages = getErrorMessages(newPasswordValidated);
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			// Рассчитываем, что на этой странице создаётся только событие ДР и выводим ссылку на него
			this.data.eventAddPoint$.subscribe({
				next: point => {
					this.auth
						.updateUserBirthDate(this._user.uid, {
							birthDate: this._birthDate,
							birthDatePointId: point.id,
						})
						.then(() => {
							this.notify.add({
								title: 'Создано событие',
								component: LinkPointComponent,
								inputs: {
									pointId: point.id,
									pointName: this.birthDateEventName,
								},
								autoremove: true,
								view: 'positive',
							});
						});
					this.cdr.markForCheck();
				},
			}),
		);

		this.subscriptions.add(
			this.auth.eventVerifyEmailSent$.subscribe({
				next: () => {
					this.verifyButtonDisabled = false;
					this.cdr.markForCheck();
				},
			}),
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

	get user() {
		return this._user;
	}

	get isGoogle() {
		return this._user?.providerData.length === 1 && this._user?.providerData[0].providerId === 'google.com';
	}

	get isGoogleLinked() {
		return (
			this._user?.providerData.length > 1 &&
			this._user?.providerData.some(provider => provider.providerId === 'google.com')
		);
	}

	get googleProfile() {
		return this._user?.providerData.find(provider => provider.providerId === 'google.com');
	}

	get isPassword() {
		return this._user?.providerData.length === 1 && this._user?.providerData[0].providerId === 'password';
	}

	get birthDatePointId() {
		return this._birthDatePointId;
	}

	get userpicLoading$() {
		return this.store.select(selectUserpicLoading);
	}

	get profileLoading$() {
		return this.store.select(selectProfileLoading);
	}

	get emailLoading$() {
		return this.store.select(selectEmailLoading);
	}

	get passwordLoading$() {
		return this.store.select(selectPasswordLoading);
	}

	get removeLoading$() {
		return this.store.select(selectRemoveLoading);
	}

	get unlinkLoading$() {
		return this.store.select(selectUnlinkLoading);
	}

	birthDatePicked(date: Date) {
		this.birthDatePickerValue = date;
	}

	updateNameAndPhoto() {
		this.store.dispatch(setProfileLoading({ profileLoading: true }));
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
		const bdFinalValue = format(this.birthDatePickerValue, Constants.fullDateFormat);

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
		this.auth.updateEmail(this._user, this.formEmail.controls['email'].value);
	}

	updatePassword() {
		this.store.dispatch(setPasswordLoading({ passwordLoading: true }));
		this.auth.updatePassword(
			this._user,
			this.formPassword.controls['password'].value,
			this.formPassword.controls['new-password'].value,
		);
	}

	removeAccount() {
		this.notify
			.confirm({
				title: 'Точно удалить учётную запись? Действие необратимо!',
			})
			.subscribe({
				next: () => {
					this.store.dispatch(setRemoveLoading({ removeLoading: true }));
					this.auth.removeAccount(this._user, this._birthDatePointId);
					this.cdr.detectChanges();
				},
				error: () => {
					this.store.dispatch(setRemoveLoading({ removeLoading: false }));
					this.cdr.detectChanges();
				},
				complete: () => {
					this.store.dispatch(setRemoveLoading({ removeLoading: false }));
					this.cdr.detectChanges();
				},
			});
	}

	trackBy(index: number, item: string): string {
		return item;
	}

	linkGoogle() {
		this.auth
			.linkGoogle()
			.then(user => {
				this.notify.add({
					title: `Google аккаунт ${user?.displayName} (${user?.email}) успешно добавлен`,
					short: true,
					view: 'positive',
				});
				this.timestamp = +new Date();
				this.cdr.markForCheck();
			})
			.catch(err => {
				this.notify.add({
					title: 'Не&nbsp;удалось добавить Google аккаунт',
					text:
						err.code === 'auth/credential-already-in-use'
							? 'Этот Google аккаунт уже используется в&nbsp;другой учётной записи'
							: undefined,
					short: true,
					view: 'negative',
				});
				console.error(err);
				this.cdr.markForCheck();
			});
	}

	unlinkGoogle() {
		this.notify
			.confirm({
				title: 'Точно отвязать Google аккаунт?',
			})
			.subscribe({
				next: () => {
					this.store.dispatch(setUnlinkLoading({ unlinkLoading: true }));
					this.auth
						.unlinkGoogle()
						.then(() => {
							this.notify.add({
								title: 'Google аккаунт успешно отвязан',
								short: true,
								view: 'positive',
							});
							this.cdr.markForCheck();
						})
						.catch(err => {
							this.notify.add({
								title: 'Не&nbsp;удалось удалить Google аккаунт',
								short: true,
								view: 'negative',
							});
							console.error(err);
							this.cdr.markForCheck();
						});
					this.cdr.detectChanges();
				},
				error: () => {
					this.store.dispatch(setUnlinkLoading({ unlinkLoading: false }));
					this.cdr.detectChanges();
				},
				complete: () => {
					this.store.dispatch(setUnlinkLoading({ unlinkLoading: false }));
					this.cdr.detectChanges();
				},
			});
	}
}
