import { EnvironmentProviders, Provider } from '@angular/core';

export interface Environment {
	production: boolean;
	mock: boolean;
	apiKey: string;
	fbDbUrl: string;
	providers: (Provider | EnvironmentProviders)[];
}
