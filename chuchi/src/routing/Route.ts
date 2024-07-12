import Request from './Request.js';

export default class Route {
	uri: string | RegExp;
	private isRegex: boolean;
	private loadComp: (req: Request) => Promise<any>;

	/**
	 * Creates a new route
	 *
	 * @param uri The uri of the route can be a string or a regular expression with named groups
	 * @param loadComp The component to be loaded when the route is matched
	 */
	constructor(
		uri: string | RegExp,
		loadComp: (req: Request) => Promise<any>,
	) {
		this.uri = uri;
		this.isRegex = typeof this.uri !== 'string';
		this.loadComp = loadComp;

		if (
			typeof this.uri === 'string' &&
			this.uri.length > 1 &&
			this.uri.endsWith('/')
		)
			this.uri = this.uri.substring(0, this.uri.length - 1);

		if (this.isRegex && !(uri instanceof RegExp))
			throw new Error('expected a regex as uri');
	}

	/**
	 * Checks if the route matches the given request should return true if the route matches the request
	 *
	 * @param req The request to match
	 */
	check(req: Request): boolean {
		const reqUri = req.pathname;

		if (!this.isRegex) return this.uri === reqUri;

		const match = reqUri.match(this.uri);
		return !!match && match[0] === reqUri;
	}

	/**
	 * Returns the regex matches
	 */
	toRegexProps(req: Request): Record<string, string> {
		if (!this.isRegex) return {};

		const match = req.pathname.match(this.uri);
		return match?.groups ?? {};
	}

	/**
	 * Returns the search props
	 */
	toSearchProps(req: Request): Record<string, string> {
		return Object.fromEntries(req.url.searchParams.entries());
	}

	/**
	 * Returns the properties of this route
	 */
	toProps(req: Request): Record<string, string> {
		return {
			...this.toRegexProps(req),
			...this.toSearchProps(req),
		};
	}

	/**
	 * Loads the component corresponding to this route
	 */
	async load(req: Request) {
		return await this.loadComp(req);
	}
}
