import { Component, Input } from '@angular/core';

@Component({
	selector: '[app-main-item]',
	templateUrl: './main-item.component.html',
})
export class MainItemComponent {
	@Input() count!: number;
}
