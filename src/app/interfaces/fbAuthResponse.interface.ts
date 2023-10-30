export interface FbAuthResponse {
	displayName?: string;
	email: string;
	expiresIn: number;
	idToken: string;
	kind?: string;
	localId?: string;
	refreshToken?: string;
	registered: boolean;
}
