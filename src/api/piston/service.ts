const PistonWorker = new Worker(new URL("worker.ts", import.meta.url).href);

PistonWorker.onmessage = (event: MessageEvent) => {
	console.log(event.data);
};

export namespace PistonService {
	export function submit() {
		// TODO: use real data
		PistonWorker.postMessage("hello world");
	}
}
