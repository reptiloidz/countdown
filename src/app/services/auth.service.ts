import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
	Observable,
	ReplaySubject,
	BehaviorSubject,
	Subject,
	Subscription,
	concatMap,
	take,
} from 'rxjs';
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
	deleteUser,
	reauthenticateWithCredential,
	EmailAuthProvider,
	EmailAuthCredential,
	sendPasswordResetEmail,
} from '@angular/fire/auth';
import { goOnline, objectVal, query, ref, set } from '@angular/fire/database';
import { Point } from '../interfaces/point.interface';
import { NotifyService } from './notify.service';
import { HttpService } from './http.service';
import { UserProfile } from '../interfaces/userProfile.interface';
import { UserExtraData } from '../interfaces/userExtraData.interface';

@Injectable({
	providedIn: 'root',
})
export class AuthService implements OnDestroy {
	constructor(
		private httpClient: HttpClient,
		private http: HttpService,
		private router: Router,
		private authFB: Auth,
		private notify: NotifyService
	) {
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

		this.subscriptions.add(
			this.eventLogin$
				.pipe(
					concatMap((id) => {
						return this.getUserData(id).pipe(take(1));
					})
				)
				.subscribe({
					next: (data) => {
						if (!data) {
							this._user?.uid &&
								this.updateUserBirthDate(this._user.uid, {
									birthDate: '',
									birthDatePointId: '',
									auth: true,
								}).then(() => {
									this.router.navigate(['/profile/']);
									this.notify.add({
										title: `Заполните профиль`,
									});
								});
						}
					},
				})
		);
	}

	private subscriptions = new Subscription();
	private _eventEditAccessCheckSubject = new ReplaySubject<{
		pointId?: string;
		access: boolean;
	}>();
	eventEditAccessCheck$ = this._eventEditAccessCheckSubject.asObservable();

	private _eventLoginSubject = new Subject<string>();
	eventLogin$ = this._eventLoginSubject.asObservable();

	private _eventProfileUpdatedSubject = new BehaviorSubject<UserProfile>({
		displayName: '',
	});
	eventProfileUpdated$ = this._eventProfileUpdatedSubject.asObservable();

	private _eventEmailUpdatedSubject = new Subject<string>();
	eventEmailUpdated$ = this._eventEmailUpdatedSubject.asObservable();

	private _eventPasswordUpdatedSubject = new Subject<boolean | void>();
	eventPasswordUpdated$ = this._eventPasswordUpdatedSubject.asObservable();

	private _eventAccountDeletedSubject = new Subject<void>();
	eventAccountDeleted$ = this._eventAccountDeletedSubject.asObservable();

	private _eventResetPasswordSubject = new Subject<void>();
	eventResetPassword$ = this._eventResetPasswordSubject.asObservable();

	private _eventBirthDateAddedSubject = new Subject<void>();
	eventBirthDateAdded$ = this._eventBirthDateAddedSubject.asObservable();

	private _eventVerifyEmailSentSubject = new Subject<void>();
	eventVerifyEmailSent$ = this._eventVerifyEmailSentSubject.asObservable();

	private _user: User | undefined;

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

	get currentUser() {
		return user(this.authFB);
	}

	get isAuthenticated(): boolean {
		return !!this.token;
	}

	eventBirthDateAdded() {
		this._eventBirthDateAddedSubject.next();
	}

	async login(user: UserPoint): Promise<any> {
		const value: any = await signInWithEmailAndPassword(
			getAuth(),
			user.email,
			user.password
		);

		this._user = value.user;

		this._user &&
			!this._user.displayName &&
			this.updateProfile(this._user, {
				displayName: user.email.split('@')[0],
			});

		this._eventLoginSubject.next(this._user?.uid || '');

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
			this.router.navigate(['/auth/']);
		});
	}

	checkIsAuth() {
		console.log(this.authFB);
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

	verifyEmail(user: User | undefined = this._user) {
		if (user) {
			if (this.checkEmailVerified) return;

			sendEmailVerification(user).then(() => {
				this._eventVerifyEmailSentSubject.next();
				this.notify.add({
					title: `
						Сообщение для подтверждения почты отправлено&nbsp;на ${user?.email}.
						Без подтверждения доступ открыт только к&nbsp;публичным событиям и&nbsp;только для чтения.
					`,
				});
			});
		}
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
		updateProfile(user, data)
			.then(() => {
				this._eventProfileUpdatedSubject.next(data);
			})
			.catch(() => {
				this.notify.add({
					title: 'Ошибка при обновлении профиля',
				});
			});
	}

	updateEmail(user: User, data: string, reAuthRequired = false) {
		this.reAuth(reAuthRequired).then(() => {
			updateEmail(user, data)
				.then(() => {
					this._eventEmailUpdatedSubject.next(data);
				})
				.catch((err) => {
					if (err.code === 'auth/requires-recent-login') {
						this.updateEmail(user, data, true);
					} else {
						this.notify.add({
							title: 'Произошла ошибка',
						});
					}
				});
		});
	}

	updatePassword(user: User, password: string, newPassword: string) {
		this.reAuth(true, password)
			.then(() => {
				updatePassword(user, newPassword)
					.then(() => {
						this._eventPasswordUpdatedSubject.next();
					})
					.catch(() => {
						this._eventPasswordUpdatedSubject.next(true);
						this.notify.add({
							title: 'Ошибка при обновлении пароля',
						});
					});
			})
			.catch((err) => {
				let authErrMsg = '';

				this._eventPasswordUpdatedSubject.next(true);
				switch (err.code) {
					case 'auth/wrong-password':
						authErrMsg = 'Неверный пароль';
						break;
					default:
						authErrMsg = 'Произошла ошибка';
						break;
				}

				this.notify.add({
					title: authErrMsg,
				});
			});
	}

	removeAccount(
		user: User,
		birthDatePointId: string,
		reAuthRequired = false
	) {
		this.reAuth(reAuthRequired).then(() => {
			this.updateUserBirthDate(user.uid, null)
				.then(() => {
					this.http
						.deletePoints([birthDatePointId])
						.then(() => {
							deleteUser(user)
								.then(() => {
									this._eventAccountDeletedSubject.next();
								})
								.catch((err) => {
									if (
										err.code ===
										'auth/requires-recent-login'
									) {
										this.removeAccount(
											user,
											birthDatePointId,
											true
										);
									} else {
										this.notify.add({
											title: 'Произошла ошибка',
										});
									}
								});
						})
						.catch(() => {
							this.notify.add({
								title: 'Ошибка при удалении события',
							});
						});
				})
				.catch((err) => {
					if (err.code === 'INVALID_PARAMETERS') {
						console.error(err);
						this.removeAccount(user, birthDatePointId, true);
					} else {
						this.notify.add({
							title: 'Ошибка при удалении события',
						});
					}
				});
		});
	}

	resetPassword(email: string) {
		sendPasswordResetEmail(this.authFB, email)
			.then(() => {
				this._eventResetPasswordSubject.next();
			})
			.catch(() => {
				this.notify.add({
					title: 'Не&nbsp;удалось отправить письмо для сброса пароля',
				});
			});
	}

	getUserData(id: string): Observable<UserExtraData> {
		return objectVal<any>(query(ref(this.http.db, `users/${id}`)));
	}

	async updateUserBirthDate(
		id: string,
		param: UserExtraData | null
	): Promise<void> {
		await set(ref(this.http.db, `users/${id}`), {
			birthDate: param?.birthDate || null,
			birthDatePointId: param?.birthDatePointId || null,
			auth: param?.auth || null,
		} as UserExtraData);
		return await new Promise((resolve) => {
			param && this.eventBirthDateAdded();
			resolve();
		});
	}

	async reAuth(reAuthRequired = false, password?: string): Promise<any> {
		let credential: EmailAuthCredential | null | '' = null;

		// https://stackoverflow.com/questions/37811684/how-to-create-credential-object-needed-by-firebase-web-user-reauthenticatewith
		if (this.authFB.currentUser) {
			if (!password && !reAuthRequired) {
				return new Promise((resolve) => {
					resolve(null);
				});
			}

			credential =
				this.authFB.currentUser.email &&
				EmailAuthProvider.credential(
					this.authFB.currentUser.email,
					password || prompt('Введите пароль') || ''
				);
		}

		return this.authFB.currentUser && credential
			? reauthenticateWithCredential(this.authFB.currentUser, credential)
			: new Promise((resolve) => {
					resolve(null);
			  });
	}
}
