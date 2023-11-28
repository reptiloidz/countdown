import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { passwordRepeat } from 'src/app/services/password-repeat.validator';

@Component({
	selector: 'app-reg',
	templateUrl: './reg.component.html',
})
export class RegComponent {
	form!: FormGroup;
	isLoading = false;

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
	}

	get passwordsForm() {
		return this.form.get('passwords') as FormGroup;
	}

	fieldFocus(event: Event) {
		const el: HTMLElement | null = event.target as HTMLElement;
		el.removeAttribute('readonly');
	}

	fieldBlur(event: Event) {
		const el: HTMLElement | null = event.target as HTMLElement;
		el.setAttribute('readonly', 'true');
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
