export type NonConcurrentStart = {
	done: () => void;
	/**
	 * @deprecated Will be removed in the no alpha version
	 */
	ready: () => void;
};

// todo should this be called queue?

/// synchronisation point
/**
 * A class to help make async code non concurrent.
 * This makes sure that only one async function is running at a time.
 *
 * Example:
 * ```ts
 * const nonConcurrent = new NonConcurrent();
 *
 * async function foo() {
 * 	const ready = await nonConcurrent.start();
 * 	console.log('point 1');
 * 	// do something
 * 	await timeout(100);
 * 	console.log('point 2');
 * 	ready.done();
 * }
 *
 * async function bar() {
 * 	const ready = await nonConcurrent.start();
 * 	console.log('point 3');
 * 	// do something
 * 	ready.done();
 * }
 *
 * await Promise.all([foo(), bar()]);
 * ```
 */
export default class NonConcurrent {
	private listeners: Array<(v?: null) => void>;
	private running: boolean;

	/**
	 * Creates a new NonConcurrent
	 */
	constructor() {
		this.listeners = [];
		this.running = false;
	}

	/**
	 * Waits until any other non-concurrent requests is done then waits until you call done
	 *
	 * returns an object where you need to call done
	 */
	async start(): Promise<NonConcurrentStart> {
		if (this.running) {
			await new Promise(resolve => {
				this.listeners.push(resolve);
			});
		}

		this.running = true;

		const done = () => {
			this.running = false;
			const resolve = this.listeners.shift();
			if (resolve) resolve();
		};

		return {
			done,
			ready: done,
		};
	}
}
