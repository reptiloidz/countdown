import { EnvironmentProviders, Provider } from '@angular/core';

export interface Environment {
	production: boolean;
	mock: boolean;
	firebase?: {
		apiKey: string | undefined;
		authDomain: string | undefined;
		databaseURL: string | undefined;
		projectId: string | undefined;
		storageBucket: string | undefined;
		messagingSenderId: string | undefined;
		appId: string | undefined;
		measurementId: string | undefined;
	};
	providers: (Provider | EnvironmentProviders)[];
}
