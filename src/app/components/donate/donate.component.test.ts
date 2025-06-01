import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonateComponent } from './donate.component';

describe('DonateComponent', () => {
	let component: DonateComponent;
	let fixture: ComponentFixture<DonateComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DonateComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(DonateComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have donate class on host element', () => {
		const element = fixture.nativeElement;
		expect(element.classList).toContain('donate');
	});
});
