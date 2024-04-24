import { Iteration, UserExtraData } from '.';
import { Direction, PointColorTypes } from '../types';

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
	userInfo?: UserExtraData;
	public?: boolean;
	color: PointColorTypes;
}
