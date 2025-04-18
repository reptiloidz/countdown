// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { HttpService, HttpService as MockHttpService } from 'src/app/services';
import { Environment } from '../app/interfaces';

export const environment: Environment = {
	production: false,
	mock: true,
	providers: [{ provide: HttpService, useClass: MockHttpService }],
	firebase: {
		apiKey: process.env['NG_APP_FIREBASE_API_KEY'],
		authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'],
		databaseURL: process.env['NG_APP_FIREBASE_DB_URL'],
		projectId: process.env['NG_APP_FIREBASE_PROJECT_ID'],
		storageBucket: process.env['NG_APP_FIREBASE_STORAGE_BUCKET'],
		messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
		appId: process.env['NG_APP_FIREBASE_APP_ID'],
		measurementId: process.env['NG_APP_FIREBASE_MEASUREMENT_ID'],
	},
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
