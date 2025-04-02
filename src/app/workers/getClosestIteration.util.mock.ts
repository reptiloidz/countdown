export function getClosestIterationWorker() {
	if (typeof Worker !== 'undefined') {
		const worker = new Worker(new URL('./getClosestIteration.worker.ts'));
		return worker;
	} else {
		return null;
	}
}
