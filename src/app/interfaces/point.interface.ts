import { UserExtraData } from './userExtraData.interface';
import { PointMode } from './pointMode.interface';
import { Iteration } from './iteration.interface';
import { Direction } from '../types/direction.type';
import { PointColorTypes } from '../types/pointColorTypes.type';

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
	modes?: PointMode[];
	closestIteration?: {
		date: Date;
		index: number;
		mode?: PointMode;
	};
}
