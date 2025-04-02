import { Point, PointMode } from '../interfaces';
import { getClosestIterationWorker } from '../workers/getClosestIteration.util';

export const getClosestIteration = (point: Point): Promise<{ date: Date; index: number; mode: PointMode }> => {
	const worker = getClosestIterationWorker() as Worker;
	return new Promise(resolve => {
		worker.postMessage(point);
		worker.onmessage = ({ data }) => {
			worker.terminate();
			return resolve(data);
		};
	});
};
