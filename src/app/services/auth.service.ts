import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private http: HttpClient) {}

	get token(): string {
		return '';
	}

	login(user: User): Observable<any> {
		return this.http
			.post(
				`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`,
				{
					...user,
					returnSecureToken: true,
				}
			)
			.pipe(
				tap((value) => {
					this.setToken(value);
				})
			);
	}

	logout() {}

	isAuthenticated(): boolean {
		return !!this.token;
	}

	private setToken(token: object) {
		console.log(token);
	}
}
