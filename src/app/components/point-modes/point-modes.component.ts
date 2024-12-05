import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GroupEmoji, LocalEmoji, Point, PointMode } from 'src/app/interfaces';
import { DropComponent } from '../drop/drop.component';
import { InputComponent } from '../input/input.component';
import { debounceTime, interval, Subject, Subscription } from 'rxjs';

@Component({
	selector: 'app-point-modes',
	templateUrl: './point-modes.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointModesComponent implements OnInit, OnDestroy {
	@Input() form!: FormGroup;
	@Input() point: Point | undefined;
	@Input() emojis: GroupEmoji[] = [];

	emojisCurrent: GroupEmoji[] = [];

	@Output() pointModeChanged = new EventEmitter<PointMode[]>();
	@ViewChild('filterRef') private filterRef!: InputComponent;
	@ViewChild('groupContainer', { read: ViewContainerRef })
	groupContainer!: ViewContainerRef;
	@ViewChild('groupTemplate', { read: TemplateRef })
	groupTemplate!: TemplateRef<any>;

	private filterSubject = new Subject<{
		control: string;
		drop: DropComponent;
	}>();
	private subscriptions = new Subscription();
	filterEmojiValue = '';
	firstModeEmoji = '👷';
	secondModeEmoji = '🏝';

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.filterSubject
				.pipe(debounceTime(400))
				.subscribe(({ control, drop }) => {
					this.applyFilter(control, drop);
				})
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get pointModesForm() {
		return this.form.get('pointModesForm') as FormGroup;
	}

	get firstModeEmojiValue() {
		return this.pointModesForm.controls['firstModeEmoji'].value;
	}

	get secondModeEmojiValue() {
		return this.pointModesForm.controls['secondModeEmoji'].value;
	}

	filterEmoji(emoji: LocalEmoji): boolean {
		return (
			!this.filterEmojiValue ||
			emoji.label.includes(this.filterEmojiValue) ||
			(!!emoji.tags?.length &&
				emoji.tags.some((item) => item.includes(this.filterEmojiValue)))
		);
	}

	filterEmojis(control: string, drop: DropComponent) {
		this.filterSubject.next({ control, drop });
	}

	applyFilter(control: string, drop: DropComponent) {
		this.emojisCurrent = [];
		this.groupContainer.clear();
		this.filterEmojiValue = this.filterRef.value
			.toString()
			.toLowerCase()
			.trim();

		requestAnimationFrame(() => {
			this.emojis.forEach((group) => {
				this.emojisCurrent.push({
					title: group.title,
					list: group.list.filter((emoji) => this.filterEmoji(emoji)),
				});
			});

			let index = 0;

			this.emojisCurrent = this.emojisCurrent || [...this.emojis];

			const emojisInterval = interval(10).subscribe({
				next: () => {
					this.groupContainer?.createEmbeddedView(
						this.groupTemplate,
						{
							group: this.emojisCurrent[index],
							control: this.pointModesForm.controls[control],
							drop,
						}
					);
					this.cdr.detectChanges();
					index = index + 1;
					if (index - 1 === this.emojisCurrent.length) {
						emojisInterval.unsubscribe();
					}
				},
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
