import {
	Component,
	HostBinding,
	Input,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { timer } from 'rxjs';

const ANIMATION_SPEED = 200;

@Component({
	selector: 'app-board',
	templateUrl: './board.component.html',
})
export class BoardComponent implements OnChanges {
	@HostBinding('class') get componentClass() {
		return ['board', this.mode !== 'base' && `board--${this.mode}`].join(
			' '
		);
	}

	@Input() value: string | number = '';
	@Input() initialValue: string | number = '00';
	@Input() mode: 'base' | 'sm' | 'logo' = 'base';
	@Input() label = '';
	@Input() delay = true;
	@Input() delayValue!: number;

	switchTop = false;
	switchBottom = false;

	topStaticValue: string | number = this.initialValue;
	topAnimatedValue: string | number = this.initialValue;
	bottomStaticValue: string | number = this.initialValue;
	bottomAnimatedValue: string | number = this.initialValue;
	timeInterval = new Date();

	ngOnChanges(changes: SimpleChanges) {
		if (changes['initialValue']) {
			this.topStaticValue =
				this.topAnimatedValue =
				this.bottomStaticValue =
				this.bottomAnimatedValue =
					this.initialValue;
		}
		changes['value']?.currentValue && this.switchBoard();
	}

	switchBoard() {
		if (this.delay) {
			timer(this.delayValue || Math.random() * 1000).subscribe(() => {
				this.animateBoard();
			});
		} else {
			this.animateBoard();
		}
	}

	animateBoard() {
		this.topStaticValue = this.value;
		this.switchTop = true;
		timer(ANIMATION_SPEED).subscribe(() => {
			this.switchTop = false;
			this.topAnimatedValue = this.value;

			this.bottomAnimatedValue = this.value;
			this.switchBottom = true;

			timer(ANIMATION_SPEED).subscribe(() => {
				this.bottomStaticValue = this.value;
				this.switchBottom = false;
			});
		});
	}
}
