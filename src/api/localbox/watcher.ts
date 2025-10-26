class Watcher<T> implements AsyncIterable<T> {
	// A queue for values that are triggered before a consumer is ready.
	private valueQueue: T[] = [];

	// A queue for "waiters" (consumers that are ready before a value is triggered).
	// Each "waiter" is a function that resolves a Promise.
	private waitingResolvers: ((result: IteratorResult<T>) => void)[] = [];

	// State to track if the generator should be closed.
	private isDone: boolean = false;

	/**
	 * Triggers a new value to be sent to the generator.
	 * If the generator is already waiting for a value, it will be resolved.
	 * If not, the value is queued until the generator requests it.
	 * @param value The value to push into the generator.
	 */
	public trigger(value: T): void {
		if (this.isDone) {
			console.warn("Trigger called on a completed generator. Value ignored.");
			return;
		}

		// Is there a consumer waiting for a value?
		const nextResolver = this.waitingResolvers.shift();
		if (nextResolver) {
			// Yes, resolve their promise with the new value.
			nextResolver({ value: value, done: false });
		} else {
			// No, queue the value for later.
			this.valueQueue.push(value);
		}
	}

	/**
	 * Signals to the generator that no more values will be sent.
	 * This will complete the async generator loop.
	 */
	public complete(): void {
		if (this.isDone) {
			return;
		}
		this.isDone = true;

		// Resolve any and all waiting consumers with the "done" signal.
		while (this.waitingResolvers.length > 0) {
			this.waitingResolvers.shift()!({ value: undefined, done: true });
		}
	}

	/**
	 * Implementation of the AsyncIterator protocol.
	 * This is called by the `for await...of` loop.
	 */
	private next(): Promise<IteratorResult<T>> {
		// Are there values in the queue?
		if (this.valueQueue.length > 0) {
			// Yes, resolve immediately with the oldest value.
			const value = this.valueQueue.shift()!;
			return Promise.resolve({ value: value, done: false });
		}

		// Is the generator already marked as done?
		if (this.isDone) {
			// Yes, resolve immediately as done.
			return Promise.resolve({ value: undefined, done: true });
		}

		// No values and not done, so we must wait.
		// We return a new Promise and store its `resolve` function.
		// This promise will be resolved later by `trigger()` or `complete()`.
		return new Promise((resolve) => {
			this.waitingResolvers.push(resolve);
		});
	}

	/**
	 * Implementation of the AsyncIterable protocol.
	 * This allows the class itself to be used in a `for await...of` loop.
	 */
	[Symbol.asyncIterator](): AsyncIterator<T> {
		return {
			next: () => this.next(),
		};
	}
}

export const submissionWatcher = new Watcher<{
	id: string;
	testcase: number;
	status: string;
}>();
