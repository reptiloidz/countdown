import { Directive, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';

class AppLetContext<T> {
	constructor(private readonly internalDirectiveInstance: LetDirective<T>) {}

	get $implicit(): T {
		return this.internalDirectiveInstance.appLet();
	}

	get appLet(): T {
		return this.internalDirectiveInstance.appLet();
	}
}

/**
 * @example
	<ng-container *appLet="payment$ | async as paymentData">
		{{paymentData}}
		<component [data]="paymentData"></component>
	</ng-container>
 */
@Directive({
	selector: '[appLet]',
	standalone: true,
})
export class LetDirective<T> {
	appLet = input.required<T>({ alias: 'appLet' });

	constructor() {
		const viewContainer = inject(ViewContainerRef);
		const templateRef = inject(TemplateRef<AppLetContext<T>>);
		viewContainer.createEmbeddedView(templateRef, new AppLetContext<T>(this));
	}

	static ngTemplateContextGuard<T>(
		_dir: LetDirective<T>,
		_ctx: unknown,
	): _ctx is LetDirective<Exclude<T, null | undefined>> {
		return true;
	}
}
