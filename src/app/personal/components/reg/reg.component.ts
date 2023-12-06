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
import { getErrorMessages } from 'src/app/helpers/getErrorMessages';
import { hasFieldErrors } from 'src/app/helpers/hasFieldErrors';
import { mergeDeep } from 'src/app/helpers/mergeDeep';
import {
	ValidationObject,
	ValidationObjectField,
} from 'src/app/interfaces/validation.interface';
import { AuthService } from 'src/app/services/auth.service';
import { passwordRepeat } from 'src/app/services/password-repeat.validator';

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

	constructor(private auth: AuthService, private router: Router) {}

	ngOnInit(): void {
		this.form = new FormGroup({
			email: new FormControl(null, [
				Validators.required,
				Validators.email,
			]),
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
										.errors?.['email'],
								},
								required: {
									value: !this.form.controls['email']
										.errors?.['required'],
								},
								dirty: this.form.controls['email'].dirty,
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
			this.auth.register(this.form.value).subscribe({
				next: () => {
					this.isLoading = false;
					this.router.navigate(['/auth/']);
				},
				error: (err) => {
					this.isLoading = false;

					console.error('Ошибка при регистрации:\n', err.message);
				},
			});
		}
	}
}
