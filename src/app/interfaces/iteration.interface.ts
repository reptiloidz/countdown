import { IterationReasons } from '../types';

export interface Iteration {
	date: string;
	reason: IterationReasons;
	comment?: string;
}
