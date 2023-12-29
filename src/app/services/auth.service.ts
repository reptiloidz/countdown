import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../enums';
import { FbAuthResponse } from '../interfaces/fbAuthResponse.interface';
import { UserPoint } from '../interfaces/user.interface';
import {
	Auth,
	signInWithEmailAndPassword,
	signOut,
	getAuth,
	authState,
	sendEmailVerification,
	user,
	User,
	updateProfile,
	updateEmail,
	updatePassword,
} from '@angular/fire/auth';
import { goOffline, goOnline } from '@angular/fire/database';
import { Point } from '../interfaces/point.interface';
import { NotifyService } from './notify.service';
import { HttpService } from './http.service';
import { UserProfile } from '../interfaces/userProfile.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService implements OnInit, OnDestroy {
	constructor(
		private httpClient: HttpClient,
		private http: HttpService,
		private router: Router,
		private authFB: Auth,
		private notify: NotifyService
	) {}

	private subscriptions = new Subscription();
	private _eventEditAccessCheckSubject = new ReplaySubject<{
		pointId?: string;
		access: boolean;
	}>();
	eventEditAccessCheck$ = this._eventEditAccessCheckSubject.asObservable();

	private _eventProfileUpdatedSubject = new Subject<UserProfile>();
	eventProfileUpdated$ = this._eventProfileUpdatedSubject.asObservable();

	private _eventEmailUpdatedSubject = new Subject<string>();
	eventEmailUpdated$ = this._eventEmailUpdatedSubject.asObservable();

	private _eventPasswordUpdatedSubject = new Subject<string>();
	eventPasswordUpdated$ = this._eventPasswordUpdatedSubject.asObservable();

	ngOnInit(): void {
		this.subscriptions.add(
			authState(this.authFB).subscribe({
				next: (data: any) => {
					switch (data?.operationType) {
						case 'signIn':
							this.setToken(data._tokenResponse);
							goOnline(this.http.db);
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

	get checkEmailVerified() {
		return this.authFB.currentUser?.emailVerified;
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
		goOnline(this.http.db);
		this.verifyEmail();
		return await new Promise((resolve) => {
			resolve(value);
		});
	}

	logout() {
		signOut(this.authFB).then(() => {
			this.setToken(null);
			goOffline(this.http.db);
			this.router.navigate(['/auth/']);
		});
	}

	checkIsAuth() {
		console.log(this.authFB);
	}

	get currentUser() {
		return user(this.authFB);
	}

	setEditPointAccess(pointId: string | undefined, access: boolean) {
		this._eventEditAccessCheckSubject.next({
			pointId,
			access,
		});
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

	verifyEmail() {
		if (this.authFB.currentUser) {
			if (this.checkEmailVerified) return;

			sendEmailVerification(this.authFB.currentUser).then(() => {
				this.notify.add({
					title: `
						Сообщение для подтверждения почты отправлено на ${this.authFB.currentUser?.email}.
						Без подтверждения доступ открыт только к публичным событиям и только для чтения.
					`,
				});
			});
		}
	}

	get isAuthenticated(): boolean {
		return !!this.token;
	}

	setToken(response: FbAuthResponse | null) {
		if (!response) {
			localStorage.clear();
		} else {
			const expDate = new Date(
				new Date().getTime() +
					// response.expiresIn * Constants.msInSecond
					// Вместо дефолтного expiresIn используем кастомный период (неделю)
					7 * 24 * 60 * Constants.msInMinute
			);

			localStorage.setItem('fb-token', response.idToken);
			localStorage.setItem('fb-uid', response.localId);
			localStorage.setItem('fb-token-exp', expDate.toString());
		}
	}

	updateProfile(user: User, data: UserProfile) {
		updateProfile(user, data).then(() => {
			this._eventProfileUpdatedSubject.next(data);
		});
	}

	updateEmail(user: User, data: string) {
		updateEmail(user, data).then(() => {
			this._eventEmailUpdatedSubject.next(data);
		});
	}

	updatePassword(user: User, data: string) {
		updatePassword(user, data).then(() => {
			this._eventPasswordUpdatedSubject.next(data);
		});
	}
}
