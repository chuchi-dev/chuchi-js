export declare type RequestOptions = {
	origin?: RequestOrigin;
	scrollY?: number;
	index?: number;
};

export type RequestOrigin = 'manual' | 'click' | 'pop';

export default class Request {
	/**
	 * The URL of the request
	 */
	url: URL;

	/**
	 * Data which should persist between page loads
	 */
	state: any;

	/**
	 * The Scroll position of the request
	 */
	scrollY: number;

	/**
	 * The history index of the request
	 *
	 * This should only be set by the router
	 */
	index: number;

	/**
	 * The origin of the request
	 */
	origin: RequestOrigin;

	/**
	 * Creates a new request
	 * @param url must be of type URL
	 * @param state some data which should persist page loads
	 * @param opts `{origin}`
	 */
	constructor(url: URL, state: any = {}, opts: RequestOptions = {}) {
		this.url = url;
		this.state = state;
		this.origin = opts?.origin ?? 'manual';
		this.scrollY = opts?.scrollY ?? 0;
		this.index = opts?.index ?? 0;
	}

	static fromCurrent(): Request {
		const historyState = window.history.state;

		return new Request(
			new URL(window.location.href),
			historyState?.state ?? null,
			{
				origin: 'manual',
				scrollY: historyState?.scrollY ?? window.scrollY,
				index: historyState?.index ?? 0,
			},
		);
	}

	/**
	 * Returns the pathname of the request removing any trailing slashes
	 */
	get pathname(): string {
		const p = this.url.pathname;
		if (p.endsWith('/') && p.length > 1)
			return p.substring(0, p.length - 1);
		return p;
	}

	/**
	 * Returns the uri of the request
	 */
	get uri(): string {
		return this.pathname + this.url.search + this.url.hash;
	}

	/**
	 * Returns the search of the request
	 */
	get search(): URLSearchParams {
		return this.url.searchParams;
	}

	toHistoryState(): any {
		return {
			state: this.state,
			scrollY: this.scrollY,
			index: this.index,
		};
	}

	/**
	 * Returns a clone of the request, makes y shallow copy of the state
	 */
	clone(): Request {
		let state = null;
		if (this.state !== null) {
			if (typeof this.state.clone === 'function') {
				state = this.state.clone();
			} else if (typeof this.state === 'object') {
				state = { ...this.state };
			} else {
				state = this.state;
			}
		}

		return new Request(new URL(this.url.toString()), state, {
			origin: this.origin,
			scrollY: this.scrollY,
			index: this.index,
		});
	}
}
