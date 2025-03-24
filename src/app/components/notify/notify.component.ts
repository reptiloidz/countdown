import { animate, AUTO_STYLE, group, query, style, transition, trigger } from '@angular/animations';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getErrorMessages, hasFieldErrors, mergeDeep } from 'src/app/helpers';
import { Notification, ValidationObject, ValidationObjectField } from 'src/app/interfaces';
import { NotifyService } from 'src/app/services';
import { InputComponent } from '../input/input.component';
import { NotificationType } from 'src/app/types';

@Component({
	selector: 'app-notify',
	templateUrl: './notify.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('notify', [
			transition(
				':enter',
				group([
					style({
						transform: 'translateY(10px)',
						opacity: 0,
						paddingTop: 0,
					}),
					animate(
						'.1s cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: 'none',
						}),
					),
					animate(
						'.4s cubic-bezier(.1, .79, .24, .95)',
						style({
							opacity: 1,
							paddingTop: 20,
						}),
					),
					query('.notify-list__item', [
						style({
							height: 0,
						}),
						animate(
							'.4s cubic-bezier(.1, .79, .24, .95)',
							style({
								height: AUTO_STYLE,
							}),
						),
					]),
				]),
			),
			transition(
				':leave',
				group([
					animate(
						'.4s cubic-bezier(.1, .79, .24, .95)',
						style({
							transform: 'translateY(10px)',
							paddingTop: 0,
							opacity: 0,
						}),
					),
					query('.notify-list__item', [
						style({
							height: AUTO_STYLE,
						}),
						animate(
							'.1s cubic-bezier(.1, .79, .24, .95)',
							style({
								height: 0,
							}),
						),
					]),
				]),
			),
		]),
	],
})
export class NotifyComponent implements OnInit, OnDestroy {
	constructor(
		private notify: NotifyService,
		private cdr: ChangeDetectorRef,
	) {}
	@ViewChild('control') private control!: InputComponent;

	public notifyList: Notification[] = [];
	private subscriptions = new Subscription();
	private formSubscription!: Subscription;
	form!: FormGroup;
	errorMessages: string[] = [];
	promptType!: NotificationType;
	isControlEmpty = true;
	controlsValidated: ValidationObject = {
		email: {
			required: {
				value: false,
			},
			correct: {
				value: false,
			},
			dirty: false,
		},
		password: {
			required: {
				value: false,
			},
			enough: {
				value: false,
			},
			dirty: false,
		},
	};

	@HostListener('document:keydown.escape')
	onEscapeKeydown() {
		this.notify.closeModals();
	}

	ngOnInit(): void {
		this.subscriptions.add(
			this.notify.notifications$.subscribe({
				next: list => {
					this.notifyList = list;

					this.promptType = this.notifyList.find(item => item.prompt)?.type || 'text';

					this.form = new FormGroup({
						email: new FormControl(null, [
							Validators.required,
							Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'),
						]),
						password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
					});

					this.controlsValidated['email'].dirty = false;
					this.controlsValidated['password'].dirty = false;
					this.isControlEmpty = this.notifyList.some(item => item.prompt);
					this.formSubscription?.unsubscribe();
					this.formSubscription = this.form.valueChanges.subscribe({
						next: () => {
							this.errorMessages = getErrorMessages(
								mergeDeep(this.controlsValidated, {
									email: {
										correct: {
											value: !this.form.controls['email'].errors?.['pattern'],
										},
										required: {
											value: !this.form.controls['email'].errors?.['required'],
										},
										dirty: this.form.controls['email'].dirty,
									},
									password: {
										enough: {
											value: !(
												this.form.controls['password'].errors?.['minlength']?.actualLength <
												this.form.controls['password'].errors?.['minlength']?.requiredLength
											),
										},
										required: {
											value: !this.form.controls['password'].errors?.['required'],
										},
										dirty: this.form.controls['password'].dirty,
									},
								}) as ValidationObject,
							);

							this.isControlEmpty = !this.form.controls['email'].value && !this.form.controls['password'].value;
						},
					});
					this.cdr.detectChanges();
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	get hasEmailErrors() {
		return hasFieldErrors(this.controlsValidated['email'] as ValidationObjectField);
	}

	get hasPasswordErrors() {
		return hasFieldErrors(this.controlsValidated['password'] as ValidationObjectField);
	}

	get isInvalid(): boolean {
		return (
			!!(this.promptType === 'email' && this.hasEmailErrors) ||
			!!(this.promptType === 'password' && this.hasPasswordErrors) ||
			false
		);
	}

	closeNotify(date: Date) {
		this.notify.close(date);
	}

	submitNotify(date: Date) {
		this.notify.submit(date);
	}
}
