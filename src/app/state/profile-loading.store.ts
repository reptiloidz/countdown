import { Injectable, computed, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class ProfileLoadingStore {
	readonly userpicLoading = signal(false);
	readonly profileLoading = signal(false);
	readonly emailLoading = signal(false);
	readonly passwordLoading = signal(false);
	readonly removeLoading = signal(false);
	readonly unlinkLoading = signal(false);

	readonly anyLoading = computed(
		() =>
			this.userpicLoading() ||
			this.profileLoading() ||
			this.emailLoading() ||
			this.passwordLoading() ||
			this.removeLoading() ||
			this.unlinkLoading(),
	);

	setUserpicLoading(value: boolean): void {
		this.userpicLoading.set(value);
	}

	setProfileLoading(value: boolean): void {
		this.profileLoading.set(value);
	}

	setEmailLoading(value: boolean): void {
		this.emailLoading.set(value);
	}

	setPasswordLoading(value: boolean): void {
		this.passwordLoading.set(value);
	}

	setRemoveLoading(value: boolean): void {
		this.removeLoading.set(value);
	}

	setUnlinkLoading(value: boolean): void {
		this.unlinkLoading.set(value);
	}
}
