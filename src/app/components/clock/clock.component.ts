import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	input,
	OnInit,
	Renderer2,
	RendererStyleFlags2,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-clock',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './clock.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockComponent implements OnInit {
	innerClass = input('');

	private readonly el = inject(ElementRef);
	private readonly renderer = inject(Renderer2);

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
