export interface Notification<T extends boolean = true> {
	date: T extends true ? Date : never;
	title: string;
	text?: string;
	short?: boolean;
	type?: 'positive' | 'neutral' | 'negative';
	autoremove?: boolean;
	prompt?: boolean;
	confirm?: boolean;
	button?: string;
}
