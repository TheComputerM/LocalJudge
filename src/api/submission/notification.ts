export class Notifier<T> implements AsyncIterable<T> {
	private valueQueue: T[] = [];
	private waitingResolvers: ((result: IteratorResult<T>) => void)[] = [];
	private isDone: boolean = false;

	constructor(
		private remaining: number = Infinity,
		private readonly hooks: Partial<{
			onCleanup: () => void;
		}> = {},
	) {
		if (remaining <= 0) {
			this.cleanup();
		}
	}

	/**
	 * Triggers a new value to be sent to the generator.
	 * Ignored if the generator is already done.
	 * @param value The value to push into the generator.
	 */
	public trigger(value: T): void {
		if (this.isDone) {
			console.warn("Trigger called on a completed generator. Value ignored.");
			return;
		}

		// Process the value first
		const nextResolver = this.waitingResolvers.shift();
		if (nextResolver) {
			nextResolver({ value: value, done: false });
		} else {
			this.valueQueue.push(value);
		}

		// Check for auto-completion by counting down
		this.remaining--;
		if (this.remaining <= 0) {
			this.cleanup();
		}
	}

	public cleanup(): void {
		if (this.isDone) {
			return;
		}
		this.isDone = true;

		// Clear all pending waiters
		while (this.waitingResolvers.length > 0) {
			this.waitingResolvers.shift()!({ value: undefined, done: true });
		}

		// Fire the completion callback, if it exists.
		this.hooks.onCleanup?.();
	}

	/**
	 * Implementation of the AsyncIterator protocol.
	 */
	private next(): Promise<IteratorResult<T>> {
		if (this.valueQueue.length > 0) {
			const value = this.valueQueue.shift()!;
			return Promise.resolve({ value: value, done: false });
		}

		// If we are done and the queue is empty, signal completion.
		if (this.isDone) {
			return Promise.resolve({ value: undefined, done: true });
		}

		// Otherwise, wait for a new value or completion.
		return new Promise((resolve) => {
			this.waitingResolvers.push(resolve);
		});
	}

	/**
	 * Implementation of the AsyncIterable protocol.
	 */
	[Symbol.asyncIterator](): AsyncIterator<T> {
		return {
			next: () => this.next(),
		};
	}
}

export class NotificationManager<T> {
	private notifiers: Map<string, Notifier<T>> = new Map();

	public create(id: string, limit: number) {
		this.notifiers.set(
			id,
			new Notifier(limit, {
				onCleanup: () => {
					this.delete(id);
				},
			}),
		);
	}

	public get(id: string) {
		return this.notifiers.get(id);
	}

	public delete(id: string) {
		this.notifiers.delete(id);
	}

	public notify(id: string, notification: T) {
		const notifier = this.notifiers.get(id);
		if (notifier) {
			notifier.trigger(notification);
		}
	}
}
