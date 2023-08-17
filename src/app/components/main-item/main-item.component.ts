import { Component, Input } from '@angular/core';
import { Point } from 'src/app/interfaces/point.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent {
	constructor(private data: DataService) {}

	@Input() point!: Point;

	delete(id: string | undefined) {
		confirm('Удалить событие?') && this.data.removePoint(id);
	}
}
