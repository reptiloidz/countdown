import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { appRoutes } from '../app.routes';
import { FirebaseOptions, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { environment } from 'src/environments/environment';
import { FontProvider } from '../providers/font.provider';

export const appConfig: ApplicationConfig = {
	providers: [
		provideAnimations(),
		provideRouter(appRoutes, withPreloading(PreloadAllModules)),
		provideHttpClient(withInterceptorsFromDi()),
		{
			provide: APP_INITIALIZER,
			useFactory: FontProvider,
			multi: true,
		},
		provideFirebaseApp(() => initializeApp(environment.firebase as FirebaseOptions)),
		provideAuth(() => getAuth()),
		provideDatabase(() => getDatabase()),
		provideNgxMask(),
	],
};
