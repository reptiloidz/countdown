export interface Notification<T extends boolean = true> {
	date: T extends true ? Date : never;
	title: string;
	text?: string;
	type?: 'positive' | 'neutral' | 'negative';
	autoremove?: boolean;
}
