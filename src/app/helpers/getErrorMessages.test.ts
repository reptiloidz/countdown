import { getErrorMessages } from './getErrorMessages';
import { ValidationObject } from '../interfaces';

describe('getErrorMessages', () => {
	it('should return an empty array when there are no errors', () => {
		const validationObject: ValidationObject = {
			field1: {
				required: {
					value: true,
					message: '',
				},
				dirty: true,
			},
			field2: {
				required: {
					value: true,
					message: '',
				},
				dirty: true,
			},
		};

		const result = getErrorMessages(validationObject);
		expect(result).toEqual([]);
	});

	it('should return error messages for fields that are dirty and have no value', () => {
		const validationObject: ValidationObject = {
			field1: {
				required: {
					value: false,
					message: 'Error message 1',
				},
				dirty: true,
			},
			field2: {
				required: {
					value: false,
					message: 'Error message 2',
				},
				dirty: true,
			},
		};

		const result = getErrorMessages(validationObject);
		expect(result).toEqual(['Error message 1', 'Error message 2']);
	});

	it('should ignore fields that are not dirty', () => {
		const validationObject: ValidationObject = {
			field1: {
				required: {
					value: false,
					message: 'Error message 1',
				},
				dirty: false,
			},
			field2: {
				required: {
					value: false,
					message: 'Error message 2',
				},
				dirty: true,
			},
		};

		const result = getErrorMessages(validationObject);
		expect(result).toEqual(['Error message 2']);
	});
});
