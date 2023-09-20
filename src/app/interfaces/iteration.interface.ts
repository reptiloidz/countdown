import { IterationReasons } from './iterationReasons.interface';

export interface Iteration {
	date: string;
	reason: IterationReasons;
	comment?: string;
}
