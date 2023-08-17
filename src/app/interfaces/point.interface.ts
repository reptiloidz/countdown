import { Direction } from './direction.type';

export interface Point {
	title: string;
	description: string;
	date: string;
	id?: string;
	direction: Direction;
}
