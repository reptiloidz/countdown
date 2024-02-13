import { IterationReasons } from '.';

export interface Iteration {
	date: string;
	reason: IterationReasons;
	comment?: string;
}
