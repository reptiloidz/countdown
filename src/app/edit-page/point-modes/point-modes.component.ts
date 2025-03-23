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
import { DropComponent } from '../../components/drop/drop.component';
import { InputComponent } from '../../components/input/input.component';
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
	@Output() pointModeClosed = new EventEmitter<void>();
	@ViewChild('filterRef') filterRef!: InputComponent;
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
	loading = false;
	firstDropOpened = false;
	secondDropOpened = false;

	constructor(private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.subscriptions.add(
			this.filterSubject.pipe(debounceTime(400)).subscribe(({ control, drop }) => {
				this.applyFilter(control, drop);
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get pointModesForm() {
		return this.form.get('pointModesForm') as FormGroup;
	}

	get firstModeTitle() {
		return this.pointModesForm.controls['firstModeTitle'];
	}

	get secondModeTitle() {
		return this.pointModesForm.controls['secondModeTitle'];
	}

	get firstModeEmoji() {
		return this.pointModesForm.controls['firstModeEmoji'];
	}

	get secondModeEmoji() {
		return this.pointModesForm.controls['secondModeEmoji'];
	}

	get firstModeTitleValue() {
		return this.firstModeTitle.value;
	}

	get secondModeTitleValue() {
		return this.secondModeTitle.value;
	}

	get firstModeEmojiValue() {
		return this.firstModeEmoji.value;
	}

	get secondModeEmojiValue() {
		return this.secondModeEmoji.value;
	}

	trackByEmoji(_index: number, emoji: LocalEmoji): string {
		return emoji.emoji;
	}

	filterEmoji(emoji: LocalEmoji): boolean {
		return (
			!this.filterEmojiValue ||
			emoji.label.includes(this.filterEmojiValue) ||
			(!!emoji.tags?.length && emoji.tags.some(item => item.includes(this.filterEmojiValue)))
		);
	}

	filterEmojis(control: string, drop: DropComponent) {
		this.loading = true;
		this.filterSubject.next({ control, drop });
		if (control === 'secondModeEmoji') {
			this.secondDropOpened = true;
		} else {
			this.firstDropOpened = true;
		}
	}

	dropClosed() {
		this.firstDropOpened = false;
		this.secondDropOpened = false;
	}

	switchModes() {
		const modes = [
			{
				icon: this.firstModeEmojiValue,
				name: this.firstModeTitleValue,
			},
			{
				icon: this.secondModeEmojiValue,
				name: this.secondModeTitleValue,
			},
		] as PointMode[];

		this.firstModeEmoji.setValue(modes[1].icon);
		this.firstModeTitle.setValue(modes[1].name);
		this.secondModeEmoji.setValue(modes[0].icon);
		this.secondModeTitle.setValue(modes[0].name);
	}

	applyFilter(control: string, drop: DropComponent) {
		this.emojisCurrent = [];
		this.groupContainer?.clear();
		this.filterEmojiValue = this.filterRef.value.toString().toLowerCase().trim();

		requestAnimationFrame(() => {
			this.emojis.forEach(group => {
				this.emojisCurrent.push({
					title: group.title,
					list: group.list.filter(emoji => this.filterEmoji(emoji)),
				});
			});

			let index = 0;

			this.emojisCurrent = this.emojisCurrent || [...this.emojis];

			const emojisInterval = interval(10).subscribe({
				next: () => {
					this.groupContainer?.createEmbeddedView(this.groupTemplate, {
						group: this.emojisCurrent[index],
						control: this.pointModesForm.controls[control],
						drop,
					});
					index = index + 1;
					this.loading = false;
					if (index === this.emojisCurrent.length) {
						emojisInterval.unsubscribe();
					}
					this.cdr.detectChanges();
				},
			});
		});
	}

	clickEmoji(emoji: string, control: FormControl, drop: DropComponent) {
		control.setValue(emoji);
		this.emojisCurrent = [];
		this.groupContainer?.clear();
		drop.closeHandler();
	}

	resetModes() {
		this.firstModeTitle.reset();
		this.secondModeTitle.reset();
		this.pointModeClosed.emit();
	}

	submitModes() {
		this.pointModeChanged.emit([
			{
				icon: this.firstModeEmojiValue,
				name: this.pointModesForm.controls['firstModeTitle'].value,
			},
			{
				icon: this.secondModeEmojiValue,
				name: this.pointModesForm.controls['secondModeTitle'].value,
			},
		]);
	}
}
