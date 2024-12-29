import {
	Component,
	HostBinding,
	Input,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { Point } from 'src/app/interfaces';
import { SortTypes } from 'src/app/types';

@Component({
	selector: 'app-date-points-popup',
	templateUrl: './date-points-popup.component.html',
})
export class DatePointsPopupComponent {
	@HostBinding('class') class = 'date-points-popup';

	@Input() pointsList: Point[] = [];
	@Input() sortType!: SortTypes;
	@Input() footerRef!: TemplateRef<unknown>;
	@Input() listRef!: TemplateRef<unknown>;
	@ViewChild('containerRef', { read: ViewContainerRef, static: true })
	containerRef!: ViewContainerRef;
}
