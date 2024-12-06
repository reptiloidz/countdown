import { IterationReasons } from '../types';
import { PointMode } from './pointMode.interface';

export interface Iteration {
	date: string;
	reason: IterationReasons;
	comment?: string;
	mode?: PointMode;
}
