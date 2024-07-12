export type LatestStart = {
	canceled: boolean;
	// throw an error if the function was canceled
	done: () => void;
};

/**
 * A class to help make async code non concurrent.
 * Only the latest async functions get the go ahead the other ones get cancelled.
 */
export default class Latest {
	private listeners: Array<(canceled: boolean) => void>;
	private running: boolean;

	constructor() {
		this.listeners = [];
		this.running = false;
	}

	async start(): Promise<LatestStart> {
		let canceled = false;

		if (this.running) {
			canceled = await new Promise<boolean>(resolve => {
				this.listeners.push(resolve);
			});
		}

		this.running = true;

		return {
			canceled,
			done: () => {
				if (canceled)
					throw new Error('calling done on a cancelled function');

				// since all promises are delayed to the next microtask we can set
				// running before
				this.running = false;

				// notify the latest
				const latest = this.listeners.pop();
				if (!latest) return;

				this.listeners.forEach(resolve => resolve(true));
				this.listeners = [];

				latest(false);
			},
		};
	}
}
