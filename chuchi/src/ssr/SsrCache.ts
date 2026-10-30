export default class SsrCache {
	private store: Map<string, any>;

	constructor() {
		this.store = new Map();

		if (typeof window !== 'undefined' && 'SSR_STORE' in window)
			this.store = new Map(Object.entries(window.SSR_STORE as any));
	}

	/**
	 * check if the value is in the cache else calls the fn
	 */
	async load<T>(key: string, fn: () => Promise<T>): Promise<T> {
		if (this.store.has(key)) return this.store.get(key);
		const v = await fn();
		this.set(key, v);
		return v;
	}

	/**
	 * Returns the value from the cache
	 */
	get<T = any>(key: string): T | null {
		return this.store.get(key) ?? null;
	}

	/**
	 * Sets the value in the cache
	 */
	set<T>(key: string, val: T) {
		this.store.set(key, val);
	}

	/**
	 * Clears the cache
	 */
	clear() {
		this.store.clear();
	}

	/**
	 * Returns the cache as json
	 */
	jsonStringify(): string {
		return JSON.stringify(Object.fromEntries(this.store)).replaceAll(
			'<',
			'\\u003c',
		);
	}

	/**
	 * Returns the cache in a script tag
	 */
	toHead(): string {
		return `\n\t\t<script>window.SSR_STORE = ${this.jsonStringify()};</script>`;
	}
}
