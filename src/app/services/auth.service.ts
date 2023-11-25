import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../enums';
import { FbAuthResponse } from '../interfaces/fbAuthResponse.interface';
import { UserPoint } from '../interfaces/user.interface';
import {
	Auth,
	signInWithEmailAndPassword,
	signOut,
	getAuth,
	user,
	authState,
	User,
} from '@angular/fire/auth';
import { goOffline, getDatabase, goOnline } from '@angular/fire/database';
import { Point } from '../interfaces/point.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService implements OnInit, OnDestroy {
	constructor(
		private httpClient: HttpClient,
		private router: Router,
		private authFB: Auth
	) {}

	private subscriptions: Subscription = new Subscription();

	ngOnInit(): void {
		this.subscriptions.add(
			authState(this.authFB).subscribe({
				next: (data: any) => {
					switch (data?.operationType) {
						case 'signIn':
							this.setToken(data._tokenResponse);
							goOnline(getDatabase());
							break;

						default:
							break;
					}
				},
			})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	checkAccessEdit(point: Point) {
		return point.user === this.uid;
	}

	get uid() {
		return localStorage.getItem('fb-uid');
	}

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

	async login(user: UserPoint): Promise<any> {
		const value: any = await signInWithEmailAndPassword(
			getAuth(),
			user.email,
			user.password
		);
		this.setToken(value._tokenResponse);
		goOnline(getDatabase());
		return await new Promise((resolve) => {
			resolve(value);
		});
	}

	logout() {
		signOut(this.authFB).then(() => {
			this.setToken(null);
			goOffline(getDatabase());
			this.router.navigate(['/auth/']);
		});
	}

	checkIsAuth() {
		console.log(this.authFB);
	}

	register(user: UserPoint): Observable<any> {
		return this.httpClient.post(
			`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.apiKey}`,
			{
				...user,
				returnSecureToken: true,
			}
		);
	}

	isAuthenticated(): boolean {
		return !!this.token;
	}

	setToken(response: FbAuthResponse | null) {
		if (!response) {
			localStorage.clear();
		} else {
			const expDate = new Date(
				new Date().getTime() + response.expiresIn * Constants.msInSecond
			);

			localStorage.setItem('fb-token', response.idToken);
			localStorage.setItem('fb-uid', response.localId);
			localStorage.setItem('fb-token-exp', expDate.toString());
		}
	}
}
