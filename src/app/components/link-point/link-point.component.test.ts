import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkPointComponent } from './link-point.component';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

jest.mock('@angular/router');

describe('LinkPointComponent', () => {
	let component: LinkPointComponent;
	let fixture: ComponentFixture<LinkPointComponent>;
	let routerMock: Router;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [LinkPointComponent],
			imports: [],
			providers: [{ provide: Router, useValue: routerMock }],
			schemas: [NO_ERRORS_SCHEMA],
		}).compileComponents();
		routerMock = {
			navigate: jest.fn(),
		} as unknown as Router;

		fixture = TestBed.createComponent(LinkPointComponent);
		component = fixture.componentInstance;
	});

	it('should render link with pointName and correct routerLink', () => {
		component.pointId = '123';
		component.pointName = 'Test Point';
		fixture.detectChanges();

		const linkDebugEl = fixture.debugElement.query(By.css('.notify-list__link'));
		const linkElement: HTMLAnchorElement = linkDebugEl.nativeElement;

		expect(linkElement.textContent).toBe('Test Point');
		expect(linkDebugEl.properties['routerLink']).toBe('/point/123');
	});
});
