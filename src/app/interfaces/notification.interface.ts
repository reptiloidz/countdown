import { NotificationType } from '../types';

export interface Notification<T extends boolean = true> {
	date: T extends true ? Date : never;
	title: string;
	text?: string;
	short?: boolean;
	view?: 'positive' | 'neutral' | 'negative';
	autoremove?: boolean;
	prompt?: boolean;
	confirm?: boolean;
	button?: string;
	type?: NotificationType;
	icon?: string;
}
