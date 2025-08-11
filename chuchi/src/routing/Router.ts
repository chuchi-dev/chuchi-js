import Writable from '../stores/Writable.js';
import Route from './Route.js';
import Request from './Request.js';
import Barrier from 'chuchi-utils/sync/Barrier';

export type RoutingHandler = {
	dataReady: () => Promise<boolean>;
	domReady: () => Promise<boolean>;
};

export type OpenReqOptions = {
	history?: HistoryAction;
	checkCurrent?: boolean;
};

export type HistoryAction = 'push' | 'replace' | 'none';

export type OpenOptions = {
	origin?: string;
	scrollY?: number;
	history?: HistoryAction;
	checkCurrent?: boolean;
};

async function defaultRequestListener(req: Request, routing: RoutingHandler) {
	if (await routing.dataReady()) return;

	setTimeout(() => {
		routing.domReady();
	}, 100);
}

export default class Router<C = any> {
	/**
	 * All routes
	 */
	routes: Route<C>[];

	/**
	 * newRequest is a store which stores the request which is not completed
	 */
	newRequest: Writable<Request>;
	private requestListener: (req: Request, routing: RoutingHandler) => void;
	private newRequestVersion: number;

	/**
	 * currentRequest is a store which stores the current request
	 *
	 * Never set this request manually
	 *
	 * This might update without a new request (for example calling pushReq)
	 */
	currentRequest: Writable<Request>;

	/**
	 * Creates a new Router to access it from everywhere, store it in a context
	 */
	constructor() {
		this.routes = [];

		this.newRequest = new Writable(null as any);
		this.requestListener = defaultRequestListener;
		this.newRequestVersion = 0;

		this.currentRequest = new Writable(null as any);
	}

	/**
	 * Register a route with a uri and a load component function
	 *
	 * @param uri should either be a string or a Regex object with
	 * named groups
	 * @param loadComp should be function which loads a component
	 */
	register(
		uri: string | RegExp,
		loadComp: (req: Request) => Promise<C>,
	): Route<C> {
		return this.registerRoute(new Route(uri, loadComp));
	}

	/**
	 * Registers a route
	 */
	registerRoute(route: Route<C>): Route<C> {
		this.routes.push(route);
		return route;
	}

	/**
	 * Handle Requests
	 * when everything you wan't to do is done
	 * call routing.dataReady
	 * and then when the dom is updated call
	 * routing.domReady
	 *
	 * @param fn `(Request, routing) -> void`
	 * @returns a function to remove the listener
	 */
	onRequest(fn: (req: Request, routing: RoutingHandler) => void): () => void {
		this.requestListener = fn;

		return () => {
			this.requestListener = defaultRequestListener;
		};
	}

	/**
	 * Handles Route requests (overrides onRequest)
	 */
	onRoute(
		fn: (
			req: Request,
			route: Route<C> | null,
			routing: RoutingHandler,
		) => void,
	): () => void {
		return this.onRequest((req, ready) => {
			const route = this.route(req);
			fn(req, route, ready);
		});
	}

	/**
	 * Setup Router on the client
	 */
	initClient(): Request {
		const req = Request.fromCurrent();
		this.openReq(req, { history: 'none', checkCurrent: false });
		this._listen();

		// disable scroll restoration
		window.history.scrollRestoration = 'manual';

		return req;
	}

	/**
	 * Setup Router on the server
	 */
	initServer(url: string): Request {
		const req = new Request(new URL(url));
		this.newRequest.set(req);
		this.currentRequest.set(req);

		return req;
	}

	/**
	 * Replaces the state of the current request
	 */
	replaceState(state: any = {}): void {
		this.currentRequest.get().state = state;
		window.history.replaceState(
			this.currentRequest.get().toHistoryState(),
			'',
		);
		this.currentRequest.notify();
	}

	/**
	 * This is only intended to be used if you wan't to modify the history state without triggering a routeChange Event
	 */
	pushReq(req: Request): void {
		this.currentRequest.setSilent(req);
		window.history.pushState(req.toHistoryState(), '', req.uri);
		this.currentRequest.notify();
	}

	/**
	 * replace the current Request without triggering any events
	 */
	replaceReq(req: Request): void {
		this.currentRequest.setSilent(req);
		window.history.replaceState(req.toHistoryState(), '', req.uri);
		this.currentRequest.notify();
	}

	/**
	 * Returns true if we can go back in history
	 */
	canGoBack(): boolean {
		const req = this.currentRequest.get();
		return req ? req.index > 0 : false;
	}

	/**
	 * Goes back a step in the history
	 */
	back(): void {
		return window.history.back();
	}

	/**
	 * This triggers the onRequest
	 * always reloads even if the page might be the same
	 */
	reload(): void {
		const req = this.currentRequest.get();
		if (!req) throw new Error('router does not have a current request');
		this.openReq(req.clone(), { history: 'replace', checkCurrent: false });
	}

	/**
	 * tries to get the route by the request
	 */
	route(req: Request): Route<C> | null {
		return this.routes.find(r => r.check(req)) ?? null;
	}

	/**
	 * Opens a request if the same page is not already open
	 *
	 * @param req
	 * @param opts `{ history: push/replace/none, checkCurrent }`
	 */
	async openReq(req: Request, opts: OpenReqOptions = {}): Promise<void> {
		const history = opts?.history ?? 'push';
		const checkCurrent = opts?.checkCurrent ?? true;

		const nUri = req.uri;
		const curReq = this.currentRequest.get();

		if (checkCurrent && curReq?.uri === nUri) return;

		if (history === 'push' && curReq) req.index = curReq.index + 1;

		// process
		// trigger requestListener
		// trigger newRequest
		// wait on requestListener reaady
		// trigger scroll when dom update
		const version = ++this.newRequestVersion;
		const hasVersionChange = () => this.newRequestVersion !== version;

		const dataBarrier = new Barrier<boolean>();
		const dataBarrier1 = dataBarrier.add();
		const dataBarrier2 = dataBarrier.add();

		const domBarrier = new Barrier<boolean>();
		const domBarrier1 = domBarrier.add();
		const domBarrier2 = domBarrier.add();

		this.requestListener(req, {
			dataReady: async () => {
				return await dataBarrier1.ready(hasVersionChange());
			},
			domReady: async () => {
				return await domBarrier1.ready(hasVersionChange());
			},
		});

		this.newRequest.set(req);
		// if version changed
		if (await dataBarrier2.ready(hasVersionChange()))
			return console.log('request overriden, version changed');

		// before we update the current Request let's store the scroll position
		// don't store it if the request comes from a pop event because that
		// means the history was already replaced
		if (curReq && req.origin !== 'pop') {
			curReq.scrollY = window.scrollY;
			window.history.replaceState(curReq.toHistoryState(), '');
		}

		if (history === 'replace') {
			window.history.replaceState(req.toHistoryState(), '', req.uri);
		} else if (history === 'push') {
			window.history.pushState(req.toHistoryState(), '', nUri);
		}

		this.currentRequest.set(req);

		// if version changed
		if (await domBarrier2.ready(hasVersionChange()))
			return console.log('request overriden, version changed');

		// restore scroll
		window.scrollTo({
			top: req.scrollY,
		});
	}

	/**
	 * Opens a url, if the protocol or the host does not match does nothing
	 *
	 * @param {string} url must start with a / or a protocol
	 * @param {any} state some data which should persist page loads
	 * @param {Object} opts `{ origin, scrollY, history, checkCurrent }`
	 */
	open(url: string, state?: any, opts: OpenOptions = {}): void {
		if (!opts?.origin) opts.origin = 'manual';
		const req = this._urlToRequest(url, state, opts);
		if (!req) return;

		this.openReq(req, opts);
	}

	private _listen() {
		window.addEventListener('click', e => {
			// @ts-ignore
			const link = e.target.closest('a');
			const openInNewTab = e.metaKey || e.ctrlKey || e.shiftKey;
			const saveLink = e.altKey;
			if (!link || !link.href || openInNewTab || saveLink) return;

			const target = link?.target ?? '';
			if (target.toLowerCase() === '_blank') return;

			const req = this._urlToRequest(link.href, {}, { origin: 'click' });
			if (!req) return;

			e.preventDefault();

			this.openReq(req);
		});

		window.addEventListener('popstate', e => {
			e.preventDefault();

			const req = Request.fromCurrent();
			req.origin = 'pop';
			this.openReq(req, { history: 'none', checkCurrent: false });
		});

		let saveScrollTimeout: any;
		window.addEventListener('scroll', () => {
			const curr = this.currentRequest.get();
			if (!curr) return;

			// store the scroll position
			curr.scrollY = window.scrollY;

			if (saveScrollTimeout) return;

			saveScrollTimeout = setTimeout(() => {
				if (curr.uri !== this.currentRequest.get().uri) return;

				// request still the same, let's update the scroll position
				window.history.replaceState(curr.toHistoryState(), '');

				saveScrollTimeout = null;
			}, 200);
		});
	}

	/// returns null if the url does not match our host and protocol
	private _urlToRequest(url: string, state = {}, opts = {}) {
		const loc = window.location;

		if (url.startsWith('/')) url = loc.protocol + '//' + loc.host + url;

		let nUrl;
		try {
			nUrl = new URL(url);
		} catch (e) {
			console.log('invalid url', e);
			return null;
		}
		// validate protocol and host
		if (nUrl.protocol !== loc.protocol || nUrl.host !== loc.host)
			return null;

		return new Request(nUrl, state, opts);
	}
}
