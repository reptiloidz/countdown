import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';

/** @deprecated Используйте `appRoutes` + `provideRouter` в `app.config.ts`. Модуль оставлен для совместимости тестов. */
@NgModule({
	imports: [RouterModule.forChild(appRoutes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
