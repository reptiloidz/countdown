import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InputComponent } from 'src/app/components/input/input.component';
import { getErrorMessages, hasFieldErrors, mergeDeep } from 'src/app/helpers';
import { ValidationObject, ValidationObjectField } from 'src/app/interfaces';
import { AuthService, NotifyService } from 'src/app/services';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent implements OnInit, OnDestroy {
	@HostBinding('class') class = 'main__inner';
	@ViewChild('passwordControl') private passwordControl!: InputComponent;

	form!: FormGroup;
	isLoading = false;
	emailForReset = '';
	controlsValidated: ValidationObject = {
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
		password: {
			required: {
				value: false,
				message: 'Вы не ввели пароль',
			},
			enough: {
				value: false,
				message: 'Пароль слишком короткий',
			},
			dirty: false,
		},
	};
	private subscriptions = new Subscription();
	errorMessages: string[] = [];

	constructor(
		private auth: AuthService,
		private router: Router,
		private notify: NotifyService,
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			email: new FormControl(null, [
				Validators.required,
				Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'),
			]),
			password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
		});

		this.subscriptions.add(
			this.form.valueChanges.subscribe({
				next: () => {
					this.controlsValidated = mergeDeep(this.controlsValidated, {
						email: {
							correct: {
								value: !this.form.controls['email'].errors?.['pattern'],
							},
							required: {
								value: !this.form.controls['email'].errors?.['required'],
							},
							dirty: this.form.controls['email'].dirty,
						},
						password: {
							enough: {
								value: !(
									this.form.controls['password'].errors?.['minlength']?.actualLength <
									this.form.controls['password'].errors?.['minlength']?.requiredLength
								),
							},
							required: {
								value: !this.form.controls['password'].errors?.['required'],
							},
							dirty: this.form.controls['password'].dirty,
						},
					}) as ValidationObject;
					this.errorMessages = getErrorMessages(this.controlsValidated);
				},
			}),
		);

		this.subscriptions.add(
			this.auth.eventResetPassword$.subscribe({
				next: () => {
					this.notify.add({
						title: `Письмо для сброса пароля отправлено&nbsp;на ${this.emailForReset}`,
						view: 'positive',
						short: true,
					});
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get hasEmailErrors() {
		return hasFieldErrors(this.controlsValidated['email'] as ValidationObjectField);
	}

	get hasPasswordErrors() {
		return hasFieldErrors(this.controlsValidated['password'] as ValidationObjectField);
	}

	trackBy(index: number, item: string): string {
		return item;
	}

	resetPassword() {
		this.notify
			.prompt({
				title: 'Введите e-mail-адрес для сброса пароля',
				button: 'Сбросить пароль',
				type: 'email',
				icon: 'at-email',
			})
			.subscribe({
				next: result => {
					this.emailForReset = result;
					result && this.auth.resetPassword(result);
				},
			});
	}

	submit() {
		if (this.form.valid) {
			this.isLoading = true;

			this.auth
				.login(this.form.value)
				.then(() => {
					this.isLoading = false;
					this.router.navigate(['']);
				})
				.catch(err => {
					this.isLoading = false;
					let authErrMsg = '';

					switch (err.code) {
						case 'auth/user-not-found':
							authErrMsg = 'Пользователя с&nbsp;таким e-mail не&nbsp;существует';
							break;
						case 'auth/wrong-password':
							authErrMsg = 'Неверный пароль';
							break;
						default:
							authErrMsg = 'Произошла ошибка';
							break;
					}

					this.notify.add({
						title: authErrMsg,
						view: 'negative',
					});

					console.error('Ошибка при авторизации:\n', err.message);
				});
		}
	}
}
