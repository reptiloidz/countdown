import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LinkPointComponent } from './link-point.component';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
jest.mock('@angular/router');

describe('LinkPointComponent', () => {
	let component: LinkPointComponent;
	let fixture: ComponentFixture<LinkPointComponent>;
	let routerMock: Router;

	beforeEach(async () => {
		routerMock = {
			navigate: jest.fn(),
			createUrlTree: jest.fn(),
			serializeUrl: jest.fn().mockReturnValue('/'),
		} as unknown as Router;

		await TestBed.configureTestingModule({
			imports: [LinkPointComponent],
			providers: [{ provide: Router, useValue: routerMock }],
		}).compileComponents();

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
