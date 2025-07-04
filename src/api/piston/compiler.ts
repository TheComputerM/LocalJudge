const worker = self as unknown as Worker;

worker.onmessage = async (event: MessageEvent) => {
	console.log(event.data);
};
