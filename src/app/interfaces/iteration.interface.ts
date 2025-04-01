import { IterationReasons } from '../types/iterationReasons.type';
import { PointMode } from './pointMode.interface';

export interface Iteration {
	date: string;
	reason: IterationReasons;
	comment?: string;
	mode?: PointMode;
}
