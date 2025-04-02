export function getClosestIterationWorker() {
	if (typeof Worker !== 'undefined') {
		const worker = new Worker(new URL('./getClosestIteration.worker.ts', import.meta.url));
		return worker;
	} else {
		return null;
	}
}
