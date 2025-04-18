const { EnvironmentPlugin } = require('webpack');
const { config } = require('dotenv');

config();

module.exports = {
	plugins: [
		new EnvironmentPlugin([
			'NG_APP_FIREBASE_API_KEY',
			'NG_APP_FIREBASE_AUTH_DOMAIN',
			'NG_APP_FIREBASE_DB_URL',
			'NG_APP_FIREBASE_PROJECT_ID',
			'NG_APP_FIREBASE_STORAGE_BUCKET',
			'NG_APP_FIREBASE_APP_ID',
			'NG_APP_FIREBASE_MEASUREMENT_ID',
		]),
	],
};
