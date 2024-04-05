import {
	Component,
	ViewChild,
	ElementRef,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PrivacyComponent } from 'src/app/components/privacy/privacy.component';
import { getErrorMessages, hasFieldErrors, mergeDeep } from 'src/app/helpers';
import { ValidationObject, ValidationObjectField } from 'src/app/interfaces';
import { AuthService, NotifyService, PopupService } from 'src/app/services';
import { passwordRepeat } from 'src/app/validators';

@Component({
	selector: 'app-reg',
	templateUrl: './reg.component.html',
})
export class RegComponent implements OnInit, OnDestroy {
	@ViewChild('passwordControl') private passwordControl!: ElementRef;
	@ViewChild('passwordRepeatControl')
	private passwordRepeatControl!: ElementRef;

	form!: FormGroup;
	isLoading = false;
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
		privacyAgree: {
			requiredTrue: {
				value: false,
				message:
					'Вы не приняли условия политики обработки персональных данных',
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
		passwordRepeat: {
			required: {
				value: false,
				message: 'Вы не ввели пароль повторно',
			},
			enough: {
				value: false,
				message: 'Повтор пароля слишком короткий',
			},
			notSame: {
				value: false,
				message: 'Пароли не совпадают',
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
		private popupService: PopupService
	) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			email: new FormControl(null, [
				Validators.required,
				Validators.pattern(
					'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
				),
			]),
			privacyAgree: new FormControl(null, [Validators.requiredTrue]),
			passwords: new FormGroup(
				{
					password: new FormControl(null, [
						Validators.required,
						Validators.minLength(8),
					]),
					passwordRepeat: new FormControl(null, [
						Validators.required,
						Validators.minLength(8),
					]),
				},
				[passwordRepeat]
			),
		});

		this.subscriptions.add(
			this.form.valueChanges.subscribe({
				next: () => {
					this.errorMessages = getErrorMessages(
						mergeDeep(this.controlsValidated, {
							email: {
								correct: {
									value: !this.form.controls['email']
										.errors?.['pattern'],
								},
								required: {
									value: !this.form.controls['email']
										.errors?.['required'],
								},
								dirty: this.form.controls['email'].dirty,
							},
							privacyAgree: {
								requiredTrue: {
									value: !this.form.controls['privacyAgree']
										.errors?.['required'],
								},
								dirty: this.form.controls['privacyAgree'].dirty,
							},
							password: {
								enough: {
									value: !(
										this.passwordsForm.controls['password']
											.errors?.['minlength']
											?.actualLength <
										this.passwordsForm.controls['password']
											.errors?.['minlength']
											?.requiredLength
									),
								},
								required: {
									value: !this.passwordsForm.controls[
										'password'
									].errors?.['required'],
								},
								dirty: this.passwordsForm.controls['password']
									.dirty,
							},
							passwordRepeat: {
								notSame: {
									value: !this.passwordsForm.errors?.[
										'notSame'
									],
								},
								enough: {
									value: !(
										this.passwordsForm.controls[
											'passwordRepeat'
										].errors?.['minlength']?.actualLength <
										this.passwordsForm.controls[
											'passwordRepeat'
										].errors?.['minlength']?.requiredLength
									),
								},
								required: {
									value: !this.passwordsForm.controls[
										'passwordRepeat'
									].errors?.['required'],
								},
								dirty: this.passwordsForm.controls[
									'passwordRepeat'
								].dirty,
							},
						}) as ValidationObject
					);
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get passwordsForm() {
		return this.form.get('passwords') as FormGroup;
	}

	get hasEmailErrors() {
		return hasFieldErrors(
			this.controlsValidated['email'] as ValidationObjectField
		);
	}

	get hasPasswordErrors() {
		return hasFieldErrors(
			this.controlsValidated['password'] as ValidationObjectField
		);
	}

	get hasPasswordRepeatErrors() {
		return hasFieldErrors(
			this.controlsValidated['passwordRepeat'] as ValidationObjectField
		);
	}

	showPrivacy() {
		this.popupService.show(
			'Политика в отношении обработки персональных данных',
			PrivacyComponent
		);
	}

	switchPasswordVisibility(event: Event) {
		const el: HTMLInputElement | null = event.target as HTMLInputElement;
		(<HTMLInputElement>this.passwordControl.nativeElement).type = el.checked
			? 'text'
			: 'password';
		(<HTMLInputElement>this.passwordRepeatControl.nativeElement).type =
			el.checked ? 'text' : 'password';
	}

	submit() {
		if (this.form.valid) {
			this.isLoading = true;
			this.auth
				.register({
					email: this.form.get('email')?.value,
					password: this.passwordsForm.get('password')?.value,
					returnSecureToken: true,
				})
				.subscribe({
					next: () => {
						this.isLoading = false;
						this.router.navigate(['/auth/']);
					},
					error: (err) => {
						this.isLoading = false;
						let authErrMsg = '';

						switch (err.error.error.message) {
							case 'EMAIL_EXISTS':
								authErrMsg =
									'Пользователь с&nbsp;таким e-mail уже существует';
								break;
							default:
								authErrMsg = 'Произошла ошибка';
								break;
						}

						this.notify.add({
							title: authErrMsg,
						});

						console.error('Ошибка при регистрации:\n', err.message);
					},
				});
		}
	}
}
