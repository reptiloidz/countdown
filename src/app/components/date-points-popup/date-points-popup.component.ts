import {
	AfterContentInit,
	Component,
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
export class DatePointsPopupComponent implements AfterContentInit {
	@Input() pointsList: Point[] = [];
	@Input() sortType!: SortTypes;
	@Input() footerRef!: TemplateRef<unknown>;
	@Input() listRef!: TemplateRef<unknown>;
	@ViewChild('containerRef', { read: ViewContainerRef, static: true })
	containerRef!: ViewContainerRef;

	ngAfterContentInit(): void {
		this.containerRef.createEmbeddedView(this.listRef, {
			pointsList: this.pointsList,
			sortType: this.sortType,
		});
		this.containerRef.createEmbeddedView(this.footerRef, {
			dateFooterPoints: this.pointsList,
		});
	}
}
