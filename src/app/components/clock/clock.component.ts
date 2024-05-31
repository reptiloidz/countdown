import {
	Component,
	ElementRef,
	OnInit,
	Renderer2,
	RendererStyleFlags2,
} from '@angular/core';

@Component({
	selector: 'app-clock',
	templateUrl: './clock.component.html',
})
export class ClockComponent implements OnInit {
	constructor(private el: ElementRef, private renderer: Renderer2) {}

	ngOnInit(): void {
		this.setClockVariable(
			'--clock-current-second',
			new Date().getSeconds().toString()
		);
		this.setClockVariable(
			'--clock-current-hour',
			new Date().getHours().toString()
		);
		this.setClockVariable(
			'--clock-current-minute',
			new Date().getMinutes().toString()
		);
	}

	setClockVariable(name: string, value: string): void {
		this.renderer.setStyle(
			this.el.nativeElement,
			name,
			value,
			RendererStyleFlags2.DashCase
		);
	}
}
