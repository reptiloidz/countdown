import { hasFieldErrors } from './hasFieldErrors';
import { ValidationObjectField } from '../interfaces';

describe('hasFieldErrors', () => {
	it('should return undefined if the field is dirty and has no errors', () => {
		const field: ValidationObjectField = {
			required: { value: false, message: 'This field is required' },
		};
		expect(hasFieldErrors(field)).toBe(undefined);
	});

	it('should return false if the field has no errors', () => {
		const field: ValidationObjectField = {
			required: { value: true, message: 'This field is required' },
		};
		expect(hasFieldErrors(field)).toBe(false);
	});

	it('should return false if the field is empty', () => {
		const field: ValidationObjectField = {};
		expect(hasFieldErrors(field)).toBe(false);
	});
});
