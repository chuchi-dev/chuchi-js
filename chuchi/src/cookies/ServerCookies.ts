import { Cookies, RemoveOptions, SetOptions } from './index.js';
import { parseCookies, SetCookie, setCookieToString } from './utils.js';

export default class ServerCookies implements Cookies {
	requestCookies: Map<string, string>;
	setCookies: Map<string, SetCookie>;

	constructor() {
		this.requestCookies = new Map();
		this.setCookies = new Map();
	}

	_init(cookies: string): void {
		// parse the cookies
		this.requestCookies = parseCookies(cookies);
	}

	/// Returns the value of the cookie with the given name, or null if it doesn't exist.
	get(name: string): string | null {
		const setCookie = this.setCookies.get(name);
		if (setCookie) {
			return (setCookie.maxAge ?? 1) > 0 ? setCookie.value : null;
		}

		return this.requestCookies.get(name) ?? null;
	}

	set(name: string, value: string, opts?: SetOptions): void {
		this.setCookies.set(name, { name, value, path: '/', ...opts });
	}

	remove(name: string, opts?: RemoveOptions): void {
		this.set(name, '', { ...opts, maxAge: 0 });
	}

	_getSetCookiesHeaders(): string[] {
		return Array.from(this.setCookies.values()).map(setCookie =>
			setCookieToString(setCookie),
		);
	}
}
