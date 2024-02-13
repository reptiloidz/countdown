import { Direction, Iteration } from '.';

export interface Point {
	title: string;
	description?: string;
	dates: Iteration[];
	id?: string;
	difference?: number;
	direction: Direction;
	greenwich: boolean;
	repeatable: boolean;
	user?: string;
	public?: boolean;
}
