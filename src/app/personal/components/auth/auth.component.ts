import { Component, OnInit } from '@angular/core';
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

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
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
			password: new FormControl(null, [
				Validators.required,
				Validators.minLength(8),
			]),
		});

		this.subscriptions.add(
			this.form.valueChanges.subscribe({
				next: () => {
					this.controlsValidated = mergeDeep(this.controlsValidated, {
						email: {
							correct: {
								value: !this.form.controls['email'].errors?.[
									'email'
								],
							},
							required: {
								value: !this.form.controls['email'].errors?.[
									'required'
								],
							},
							dirty: this.form.controls['email'].dirty,
						},
						password: {
							enough: {
								value: !(
									this.form.controls['password'].errors?.[
										'minlength'
									]?.actualLength <
									this.form.controls['password'].errors?.[
										'minlength'
									]?.requiredLength
								),
							},
							required: {
								value: !this.form.controls['password'].errors?.[
									'required'
								],
							},
							dirty: this.form.controls['password'].dirty,
						},
					}) as ValidationObject;
					this.errorMessages = getErrorMessages(
						this.controlsValidated
					);
				},
			})
		);
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

	submit() {
		if (this.form.valid) {
			this.isLoading = true;

			this.auth
				.login(this.form.value)
				.then(() => {
					this.isLoading = false;
					this.router.navigate(['']);
				})
				.catch((err) => {
					this.isLoading = false;

					console.error('Ошибка при авторизации:\n', err.message);
				});
		}
	}
}
