import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LetDirective } from './let.directive';

@Component({
	standalone: true,
	imports: [LetDirective],
	template: `<ng-container *appLet="value as item">{{ item }}</ng-container>`,
})
class LetHostComponent {
	value = 'test-value';
}

describe('LetDirective', () => {
	let fixture: ComponentFixture<LetHostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [LetHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(LetHostComponent);
		fixture.detectChanges();
	});

	it('should create an instance', () => {
		expect(fixture.nativeElement.textContent.trim()).toBe('test-value');
	});

	it('should update the template when value changes', () => {
		fixture.componentInstance.value = 'next-value';
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent.trim()).toBe('next-value');
	});
});
