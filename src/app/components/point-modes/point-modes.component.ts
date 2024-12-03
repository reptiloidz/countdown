import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LocalEmoji, Point, PointMode } from 'src/app/interfaces';
import { DropComponent } from '../drop/drop.component';
import { InputComponent } from '../input/input.component';

@Component({
	selector: 'app-point-modes',
	templateUrl: './point-modes.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointModesComponent {
	@Input() form!: FormGroup;
	@Input() point: Point | undefined;
	@Input() emojis: {
		title: string;
		visible: boolean;
		list: LocalEmoji[];
	}[] = [];
	@Output() pointModeChanged = new EventEmitter<PointMode[]>();
	@ViewChild('filterRef') private filterRef!: InputComponent;

	filterEmojiValue = '';
	firstModeEmoji = '👷';
	secondModeEmoji = '🏝';

	get pointModesForm() {
		return this.form.get('pointModesForm') as FormGroup;
	}

	get firstModeEmojiValue() {
		return this.firstEmojiControl.value;
	}

	get secondModeEmojiValue() {
		return this.secondEmojiControl.value;
	}

	get firstEmojiControl() {
		return this.pointModesForm.controls['firstModeEmoji'];
	}

	get secondEmojiControl() {
		return this.pointModesForm.controls['secondModeEmoji'];
	}

	filterEmoji(emoji: LocalEmoji): boolean {
		return (
			!this.filterEmojiValue ||
			emoji.label.includes(this.filterEmojiValue) ||
			(!!emoji.tags?.length &&
				emoji.tags.some((item) => item.includes(this.filterEmojiValue)))
		);
	}

	filterEmojis() {
		this.filterEmojiValue = this.filterRef.value
			.toString()
			.toLowerCase()
			.trim();
		this.emojis.map((group) => {
			group.visible = group.list.some((emoji) => this.filterEmoji(emoji));

			group.visible &&
				group.list.map((emoji) => {
					emoji.visible = this.filterEmoji(emoji);
				});
		});
	}

	clickEmoji(emoji: string, control: FormControl, drop: DropComponent) {
		control.setValue(emoji);
		drop.closeHandler();
	}

	trackByEmoji(_index: number, emoji: LocalEmoji): string {
		return emoji.emoji;
	}
}
