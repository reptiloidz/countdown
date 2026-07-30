import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgClassType } from 'src/app/types';
import { SvgComponent } from '../svg/svg.component';

@Component({
	selector: 'app-loader',
	standalone: true,
	imports: [CommonModule, SvgComponent],
	templateUrl: './loader.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
	@HostBinding('class') get componentClass(): string | null {
		return 'loader';
	}

	iconClass = input<NgClassType>();
}
