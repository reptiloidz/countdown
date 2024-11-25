import { inject } from '@angular/core';
import { ActionService } from '../services';

export const noPointGuard = () => {
	// Очищаем значение point в подписке eventUpdatedPoint$
	inject(ActionService).pointUpdated(undefined);

	return true;
};
