import { TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
	let component: SettingsComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [SettingsComponent],
		}).compileComponents();

		const fixture = TestBed.createComponent(SettingsComponent);
		component = fixture.componentInstance;
	});

	it('should return the sound value from localStorage if it exists', () => {
		localStorage.setItem('sound', 'long');
		expect(component.soundValue).toBe('long');
		localStorage.removeItem('sound');
	});

	it('should return the default sound value if localStorage does not have a sound value', () => {
		localStorage.removeItem('sound');
		expect(component.soundValue).toBe(component.soundValueDefault);
	});
});
