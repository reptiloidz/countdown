import { FormGroup, FormControl } from '@angular/forms';
import { passwordRepeat } from './password-repeat.validator';

describe('passwordRepeat Validator', () => {
	let formGroup: FormGroup;

	beforeEach(() => {
		formGroup = new FormGroup({
			password: new FormControl(''),
			passwordRepeat: new FormControl(''),
		});
	});

	it('should return null if passwords match', () => {
		formGroup.setValue({ password: '123456', passwordRepeat: '123456' });
		expect(passwordRepeat(formGroup)).toBeNull();
	});

	it('should return a validation error if passwords do not match', () => {
		formGroup.setValue({ password: '123456', passwordRepeat: '654321' });
		expect(passwordRepeat(formGroup)).toEqual({ notSame: true });
	});

	it('should return a validation error if one of the fields is empty', () => {
		formGroup.setValue({ password: '123456', passwordRepeat: '' });
		expect(passwordRepeat(formGroup)).toEqual({ notSame: true });
	});

	it('should return null if both fields are empty', () => {
		formGroup.setValue({ password: '', passwordRepeat: '' });
		expect(passwordRepeat(formGroup)).toBeNull();
	});
});
