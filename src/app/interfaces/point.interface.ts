import { Direction } from './direction.type';
import { Iteration } from './iteration.interface';

export interface Point {
	title: string;
	description: string;
	dates: Iteration[];
	id?: string;
	difference?: number;
	direction: Direction;
	greenwich: boolean;
	repeatable: boolean;
}
