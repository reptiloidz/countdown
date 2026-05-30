import { TestBed } from '@angular/core/testing';
import { ProfileLoadingStore } from './profile-loading.store';

describe('ProfileLoadingStore', () => {
	let store: ProfileLoadingStore;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		store = TestBed.inject(ProfileLoadingStore);
	});

	it('should be created with loading flags false', () => {
		expect(store.userpicLoading()).toBe(false);
		expect(store.anyLoading()).toBe(false);
	});

	it('should update flags via setters', () => {
		store.setEmailLoading(true);
		expect(store.emailLoading()).toBe(true);
		expect(store.anyLoading()).toBe(true);

		store.setEmailLoading(false);
		expect(store.anyLoading()).toBe(false);
	});
});
