const fs = require('fs');
const { config } = require('dotenv');

config();

const env = process.env;

const content = `
import { Environment } from '../app/interfaces';

export const environment: Environment = {
	production: false,
	mock: false,
	providers: [],
	firebase: {
		apiKey: "${env['NG_APP_FIREBASE_API_KEY']}",
		authDomain: "${env['NG_APP_FIREBASE_AUTH_DOMAIN']}",
		databaseURL: "${env['NG_APP_FIREBASE_DB_URL']}",
		projectId: "${env['NG_APP_FIREBASE_PROJECT_ID']}",
		storageBucket: "${env['NG_APP_FIREBASE_STORAGE_BUCKET']}",
		messagingSenderId: "${env['NG_APP_FIREBASE_MESSAGING_SENDER_ID']}",
		appId: "${env['NG_APP_FIREBASE_APP_ID']}",
		measurementId: "${env['NG_APP_FIREBASE_MEASUREMENT_ID']}",
	}
};
`;

fs.writeFileSync('src/environments/environment.dev.ts', content);
console.log('✅ Generated src/environments/environment.dev.ts');
