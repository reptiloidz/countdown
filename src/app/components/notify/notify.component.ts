/**
 * NotifyComponent is responsible for displaying notifications and handling user interactions
 * with them. It includes animations for showing and hiding notifications, form validation
 * for user inputs, and dynamic component creation for custom notification content.
 *
 * @remarks
 * This component uses Angular animations for smooth transitions and ChangeDetectionStrategy.OnPush
 * for performance optimization. It also listens for escape key presses to close modals.
 *
 * @example
 * <app-notify></app-notify>
 *
 * @animations
 * - `notify`: Handles the enter and leave animations for notifications.
 *
 * @hostListeners
 * - `document:keydown.escape`: Closes all modals when the escape key is pressed.
 *
 * @dependencies
 * - NotifyService: Provides notification data and methods for managing notifications.
 * - ChangeDetectorRef: Used to manually trigger change detection.
 *
 * @childComponents
 * - InputComponent: Used for user input fields within the notification form.
 *
 * @properties
 * - `notifyList` (Notification[]): List of notifications to display.
 * - `form` (FormGroup): Reactive form for user input validation.
 * - `errorMessages` (string[]): List of error messages for form validation.
 * - `promptType` (NotificationType): Type of prompt to display (e.g., email, password).
 * - `isControlEmpty` (boolean): Indicates if the input controls are empty.
 * - `controlsValidated` (ValidationObject): Tracks validation states for form controls.
 *
 * @methods
 * - `onEscapeKeydown()`: Closes all modals when the escape key is pressed.
 * - `ngOnInit()`: Initializes the component, subscribes to notification updates, and sets up form validation.
 * - `ngOnDestroy()`: Cleans up subscriptions when the component is destroyed.
 * - `hasEmailErrors`: Checks if there are validation errors for the email field.
 * - `hasPasswordErrors`: Checks if there are validation errors for the password field.
 * - `isInvalid`: Determines if the form is invalid based on the current prompt type.
 * - `trackBy(index: number, item: Notification)`: Tracks notification items by their date.
 * - `closeNotify(date: Date)`: Closes a specific notification.
 * - `submitNotify(date: Date)`: Submits a specific notification.
 */
import { animate, AUTO_STYLE, group, query, style, transition, trigger } from '@angular/animations';
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostListener,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewContainerRef,
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
	@ViewChild('notifyContent', {
		read: ViewContainerRef,
	})
	notifyContent!: ViewContainerRef;

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

					this.notifyList.forEach(item => {
						if (item.component) {
							this.cdr.markForCheck();
							const componentRef = this.notifyContent.createComponent(item.component);

							if (item.inputs) {
								for (const [key, value] of Object.entries(item.inputs)) {
									(componentRef.instance as any)[key] = value;
								}
							}
						}
					});
					this.cdr.markForCheck();
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

	trackBy(index: number, item: Notification): Date {
		return item.date;
	}

	closeNotify(date: Date) {
		this.notify.close(date);
	}

	submitNotify(date: Date) {
		this.notify.submit(date);
	}
}
