import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { passwordRepeat } from 'src/app/services/password-repeat.validator';

@Component({
	selector: 'app-reg',
	templateUrl: './reg.component.html',
})
export class RegComponent {
	@ViewChild('passwordControl') private passwordControl!: ElementRef;
	@ViewChild('passwordRepeatControl')
	private passwordRepeatControl!: ElementRef;

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
