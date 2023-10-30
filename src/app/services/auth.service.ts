import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../enums';
import { FbAuthResponse } from '../interfaces/fbAuthResponse.interface';
import { User } from '../interfaces/user.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	constructor(private http: HttpClient, private router: Router) {}

	get token(): string | null {
		if (localStorage.getItem('fb-token')) {
			const expDate = new Date(
				localStorage.getItem('fb-token-exp') ?? ''
			);
			if (expDate > new Date()) {
				return localStorage.getItem('fb-token');
			} else {
				this.logout();
				return null;
			}
		} else {
			return null;
		}
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
					this.setToken(value as FbAuthResponse);
				})
			);
	}

	logout() {
		this.setToken(null);
		this.router.navigate(['/auth/']);
	}

	isAuthenticated(): boolean {
		return !!this.token;
	}

	private setToken(response: FbAuthResponse | null) {
		if (!response) {
			localStorage.clear();
		} else {
			const expDate = new Date(
				new Date().getTime() + response.expiresIn * Constants.msInSecond
			);

			localStorage.setItem('fb-token', response.idToken);
			localStorage.setItem('fb-token-exp', expDate.toString());
		}
	}
}
