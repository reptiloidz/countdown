import { Point, PointMode } from '../interfaces';

export const getClosestIteration = (point: Point): Promise<{ date: Date; index: number; mode: PointMode }> => {
	const worker = new Worker(new URL('./../workers/getClosestIteration.worker.ts', import.meta.url), { type: 'module' });
	return new Promise(resolve => {
		worker.postMessage(point);
		worker.onmessage = ({ data }) => {
			worker.terminate();
			return resolve(data);
		};
	});
};
