export default class SsrCache {
	private store: Record<string, any>;

	constructor() {
		this.store = {};

		if (typeof window !== 'undefined' && 'SSR_STORE' in window)
			this.store = window.SSR_STORE as any;
	}

	/**
	 * check if the value is in the cache else calls the fn
	 */
	async load<T>(key: string, fn: () => Promise<T>): Promise<T> {
		if (key in this.store) return this.store[key];
		const v = await fn();
		this.set(key, v);
		return v;
	}

	/**
	 * Returns the value from the cache
	 */
	get(key: string) {
		return this.store[key] ?? null;
	}

	/**
	 * Sets the value in the cache
	 */
	set<T>(key: string, val: T) {
		this.store[key] = val;
	}

	/**
	 * Clears the cache
	 */
	clear() {
		this.store = {};
	}

	/**
	 * Returns the cache as json
	 */
	jsonStringify(): string {
		return JSON.stringify(this.store).replaceAll('<', '\\u003c');
	}

	/**
	 * Returns the cache in a script tag
	 */
	toHead(): string {
		return `\n\t\t<script>window.SSR_STORE = ${this.jsonStringify()};</script>`;
	}
}
