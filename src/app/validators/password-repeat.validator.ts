import { AbstractControl, ValidationErrors } from '@angular/forms';

export const passwordRepeat = (
	group: AbstractControl
): ValidationErrors | null => {
	let pass = group.get('password')?.value;
	let passwordRepeat = group.get('passwordRepeat')?.value;

	return pass === passwordRepeat ? null : { notSame: true };
};
