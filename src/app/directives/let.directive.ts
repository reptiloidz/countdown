import {
	Directive,
	Inject,
	Input,
	TemplateRef,
	ViewContainerRef,
} from '@angular/core';

class AppLetContext<T> {
	constructor(private readonly internalDirectiveInstance: LetDirective<T>) {}

	get $implicit(): T {
		return this.internalDirectiveInstance.appLet;
	}

	get appLet(): T {
		return this.internalDirectiveInstance.appLet;
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
})
export class LetDirective<T> {
	@Input() appLet!: T;

	constructor(
		@Inject(ViewContainerRef) viewContainer: ViewContainerRef,
		@Inject(TemplateRef) templateRef: TemplateRef<AppLetContext<T>>
	) {
		viewContainer.createEmbeddedView(
			templateRef,
			new AppLetContext<T>(this)
		);
	}

	static ngTemplateContextGuard<T>(
		_dir: LetDirective<T>,
		_ctx: any
	): _ctx is LetDirective<Exclude<T, null | undefined>> {
		return true;
	}
}
