import { LetDirective } from './let.directive';
import { ViewContainerRef, TemplateRef, EmbeddedViewRef } from '@angular/core';

describe('LetDirective', () => {
	let viewContainerRef: ViewContainerRef;
	let templateRef: TemplateRef<any>;
	let mockEmbeddedView: EmbeddedViewRef<any>;

	beforeEach(() => {
		mockEmbeddedView = {} as EmbeddedViewRef<any>;

		viewContainerRef = {
			createEmbeddedView: jest.fn().mockReturnValue(mockEmbeddedView),
			clear: jest.fn(),
			get: jest.fn(),
			insert: jest.fn(),
			move: jest.fn(),
			remove: jest.fn(),
			detach: jest.fn(),
			element: {} as any,
			injector: {} as any,
			length: 0,
		} as unknown as ViewContainerRef;

		templateRef = {} as TemplateRef<any>;
	});

	it('should create an instance', () => {
		const directive = new LetDirective(viewContainerRef, templateRef);
		expect(directive).toBeTruthy();
	});

	it('should call createEmbeddedView with correct arguments', () => {
		new LetDirective(viewContainerRef, templateRef);
		expect(viewContainerRef.createEmbeddedView).toHaveBeenCalledWith(templateRef, expect.any(Object));
	});
});
