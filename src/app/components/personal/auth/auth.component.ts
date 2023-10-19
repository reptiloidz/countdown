import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
	form!: FormGroup;

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
			console.log(this.form.value);
		}
	}
}
