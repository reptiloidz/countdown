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
	firstValueFrom,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserPoint, Point, UserProfile, UserExtraData } from '../interfaces';
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
	GoogleAuthProvider,
	signInWithPopup,
	reauthenticateWithPopup,
	linkWithPopup,
	unlink,
} from '@angular/fire/auth';
import { goOnline, objectVal, query, ref, set, update } from '@angular/fire/database';
import { NotifyService, HttpService } from '.';
import { generateUserpicName, randomHEXColor } from '../helpers';
import { millisecondsInDay } from 'date-fns/constants';
import { Store } from '@ngrx/store';
import { AppState } from '../store/reducers';
import { setEmailLoading } from '../store/actions/loading.action';

@Injectable({
	providedIn: 'root',
})
export class AuthService implements OnDestroy {
	constructor(
		private httpClient: HttpClient,
		private http: HttpService,
		private router: Router,
		private authFB: Auth,
		private notify: NotifyService,
		private store: Store<AppState>,
	) {
		this.subscriptions.add(
			authState(this.authFB).subscribe({
				next: (data: any) => {
					if (data?.accessToken && data?.uid) {
						this.setToken({
							token: data.accessToken,
							id: data.uid,
						});
						goOnline(this.http.db);
					} else {
						this.setToken();
					}
				},
			}),
		);

		this.subscriptions.add(
			this.eventLogin$
				.pipe(
					concatMap(id => {
						return this.getUserData(id).pipe(take(1));
					}),
				)
				.subscribe({
					next: data => {
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
						} else {
							this.router.navigate(['/']);
						}
					},
				}),
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

	get isGoogle() {
		return this._user?.providerData[0].providerId === 'google.com';
	}

	get token(): string | null {
		if (localStorage.getItem('fb-token')) {
			const expDate = new Date(localStorage.getItem('fb-token-exp') ?? '');
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

	async login(
		{
			user,
			google,
		}: {
			user?: UserPoint;
			google?: boolean;
		} = {
			google: false,
		},
	): Promise<any> {
		const value: any = google
			? await signInWithPopup(getAuth(), new GoogleAuthProvider())
			: user && (await signInWithEmailAndPassword(getAuth(), user.email, user.password));

		return await new Promise(resolve => {
			let displayName = '';
			let photoURL = '';

			if (google) {
				displayName = value.user.displayName;
				photoURL = value.user.photoURL;
			} else if (user) {
				displayName = user.email.split('@')[0];
				photoURL = this.getUserpic(displayName);
			}

			this._user = value.user;
			this._eventLoginSubject.next(this._user?.uid ?? '');
			this.setToken(value._tokenResponse);
			goOnline(this.http.db);
			this.verifyEmail();

			this._user &&
				(!this._user.displayName || !this._user.photoURL) &&
				this.updateProfile(this._user, {
					displayName,
					photoURL,
				});
			resolve(value);
		});
	}

	async logout() {
		await signOut(this.authFB);
		this.setToken();
		this.router.navigate(['/auth/']);
	}

	async linkGoogle(): Promise<User | null> {
		const currentUser = this.authFB.currentUser;
		const user = currentUser && (await linkWithPopup(currentUser, new GoogleAuthProvider())).user;
		return await new Promise(resolve => {
			currentUser &&
				this.updateProfile(currentUser, {
					photoURL: user?.providerData.find(provider => provider.providerId === 'google.com')?.photoURL || '',
					displayName: currentUser?.displayName || '',
				});
			return resolve(user);
		});
	}

	async unlinkGoogle(): Promise<User | null> {
		const currentUser = this.authFB.currentUser;
		const user = currentUser && (await unlink(currentUser, 'google.com'));
		return await new Promise(resolve => {
			currentUser &&
				this.updateProfile(currentUser, {
					photoURL: this.getUserpic(currentUser.displayName || ''),
					displayName: currentUser?.displayName || '',
				});
			return resolve(user);
		});
	}

	getUserpic(displayName: string) {
		return `https://ui-avatars.com/api/?name=${generateUserpicName(displayName)}&background=${randomHEXColor()}`;
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
			`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebase?.apiKey}`,
			{
				...user,
				returnSecureToken: true,
			},
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
					`,
					text: 'Без подтверждения доступ открыт только к&nbsp;публичным событиям и&nbsp;только для чтения.',
				});
			});
		}
	}

	setToken({
		token,
		id,
	}: {
		token?: string;
		id?: string;
	} = {}) {
		if (!token || !id) {
			localStorage.removeItem('fb-token');
			localStorage.removeItem('fb-uid');
			localStorage.removeItem('fb-token-exp');
		} else {
			const expDate = new Date(
				new Date().getTime() +
					// response.expiresIn * millisecondsInSecond
					// Вместо дефолтного expiresIn используем кастомный период (неделю)
					7 * millisecondsInDay,
			);

			localStorage.setItem('fb-token', token);
			localStorage.setItem('fb-uid', id);
			localStorage.setItem('fb-token-exp', expDate.toString());
		}
	}

	updateProfile(user: User, data: UserProfile) {
		updateProfile(user, data)
			.then(() => {
				update(ref(this.http.db, `users/${user.uid}`), {
					displayName: data.displayName,
					photoURL: data.photoURL,
				} as UserExtraData).then(() => {
					this._eventProfileUpdatedSubject.next(data);
				});
			})
			.catch(() => {
				this.notify.add({
					title: 'Ошибка при обновлении профиля',
					view: 'negative',
				});
			});
	}

	updateEmail(user: User, data: string, reAuthRequired = false) {
		this.reAuth(reAuthRequired)
			.then(() => {
				updateEmail(user, data)
					.then(() => {
						this._eventEmailUpdatedSubject.next(data);
					})
					.catch(err => {
						if (err.code === 'auth/requires-recent-login') {
							this.updateEmail(user, data, true);
						} else {
							this.notify.add({
								title: 'Произошла ошибка',
								view: 'negative',
							});
						}
					});
			})
			.catch(err => {
				this.wrongPasswordError(err);
			});
	}

	emailUpdateStarted() {
		this.store.dispatch(setEmailLoading({ emailLoading: true }));
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
							view: 'negative',
						});
					});
			})
			.catch(err => {
				this.wrongPasswordError(err);
			});
	}

	removeAccount(user: User, birthDatePointId: string) {
		this.reAuth(true)
			.then(() => {
				this.updateUserBirthDate(user.uid, null)
					.then(() => {
						this.http
							.deletePoints([birthDatePointId])
							.then(() => {
								deleteUser(user)
									.then(() => {
										this._eventAccountDeletedSubject.next();
									})
									.catch(err => {
										console.error(err);
										this.notify.add({
											title: 'Ошибка при удалении учётной записи',
											view: 'negative',
										});
									});
							})
							.catch(err => {
								console.error(err);
								this.notify.add({
									title: 'Ошибка при удалении события',
									view: 'negative',
								});
							});
					})
					.catch(err => {
						console.error(err);
						this.notify.add({
							title: 'Ошибка при удалении события',
							view: 'negative',
						});
					});
			})
			.catch(err => {
				this.wrongPasswordError(err);
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
					view: 'negative',
				});
			});
	}

	wrongPasswordError(err: any) {
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
			view: 'negative',
		});
	}

	getUserData(id?: string): Observable<UserExtraData> {
		return objectVal<any>(query(ref(this.http.db, `users/${id}`)));
	}

	async updateUserBirthDate(id: string, param: UserExtraData | null): Promise<void> {
		await set(ref(this.http.db, `users/${id}`), {
			birthDate: param?.birthDate ?? null,
			birthDatePointId: param?.birthDatePointId ?? null,
			auth: param?.auth || null,
		} as UserExtraData);
		return await new Promise(resolve => {
			param && this.eventBirthDateAdded();
			resolve();
		});
	}

	async reAuth(reAuthRequired = false, password?: string) {
		if (!reAuthRequired) {
			return Promise.resolve(null);
		} else if (password) {
			return this.reAuthWithCred(password);
		} else if (this.isGoogle) {
			return this.reAuthPopup();
		} else {
			return this.reAuthWithCred(
				await firstValueFrom(
					this.notify.prompt({
						title: 'Введите пароль',
						button: 'Подтвердить пароль',
						type: 'password',
					}),
				),
			);
		}
	}

	async reAuthPopup(): Promise<any> {
		if (this.authFB.currentUser) {
			return reauthenticateWithPopup(this.authFB.currentUser, new GoogleAuthProvider());
		}
	}

	async reAuthWithCred(password: string): Promise<any> {
		let credential: EmailAuthCredential | null | '' = null;

		// https://stackoverflow.com/questions/37811684/how-to-create-credential-object-needed-by-firebase-web-user-reauthenticatewith
		if (this.authFB.currentUser) {
			credential =
				this.authFB.currentUser.email && EmailAuthProvider.credential(this.authFB.currentUser.email, password);

			return credential ? reauthenticateWithCredential(this.authFB.currentUser, credential) : Promise.resolve(null);
		}
	}
}
