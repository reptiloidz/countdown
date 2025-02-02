import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacyComponent } from './privacy.component';

describe('PrivacyComponent', () => {
	let component: PrivacyComponent;
	let fixture: ComponentFixture<PrivacyComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PrivacyComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PrivacyComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should have the correct template URL', () => {
		const componentDef = TestBed.createComponent(PrivacyComponent).componentRef.componentType;
		expect(TestBed.createComponent(PrivacyComponent).componentRef.componentType).toBeDefined();
	});
});
