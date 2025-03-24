import { Component, ElementRef, Input, OnInit, Renderer2, RendererStyleFlags2 } from '@angular/core';

@Component({
	selector: 'app-clock',
	templateUrl: './clock.component.html',
})
export class ClockComponent implements OnInit {
	@Input() innerClass = '';
	constructor(
		private el: ElementRef,
		private renderer: Renderer2,
	) {}

	ngOnInit(): void {
		const currentDate = new Date();

		this.setClockVariable('--clock-current-second', currentDate.getSeconds().toString());
		this.setClockVariable('--clock-current-hour', currentDate.getHours().toString());
		this.setClockVariable('--clock-current-minute', currentDate.getMinutes().toString());
	}

	setClockVariable(name: string, value: string): void {
		this.renderer.setStyle(this.el.nativeElement, name, value, RendererStyleFlags2.DashCase);
	}
}
