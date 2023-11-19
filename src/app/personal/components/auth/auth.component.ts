import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
	form!: FormGroup;
	isLoading = false;

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
