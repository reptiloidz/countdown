const { EnvironmentPlugin } = require('webpack');
const { config } = require('dotenv');

config();

module.exports = {
	plugins: [
		new EnvironmentPlugin({
			NG_APP_FIREBASE_API_KEY: 'defaultKey',
			NG_APP_FIREBASE_AUTH_DOMAIN: 'defaultDomain',
			NG_APP_FIREBASE_DB_URL: 'defaultDbUrl',
			NG_APP_FIREBASE_PROJECT_ID: 'defaultProjectId',
			NG_APP_FIREBASE_STORAGE_BUCKET: 'defaultStorageBucket',
			NG_APP_FIREBASE_MESSAGING_SENDER_ID: 'defaultSenderId',
			NG_APP_FIREBASE_APP_ID: 'defaultAppId',
			NG_APP_FIREBASE_MEASUREMENT_ID: 'defaultMeasurementId',
		}),
	],
};
