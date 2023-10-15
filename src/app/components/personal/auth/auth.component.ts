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
			login: new FormControl(null, [Validators.required]),
			password: new FormControl(null, [Validators.required]),
		});
	}

	submit() {}
}
