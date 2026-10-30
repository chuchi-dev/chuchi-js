import { Cookies, RemoveOptions, SetOptions } from './index.js';
import { parseCookies, setCookieToString } from './utils.js';

// the philosophy here is that document.cookie is the source of truth
// so we don't cache cookies here
export default class ClientCookies implements Cookies {
	constructor() {}

	_init(_cookies: string): void {}

	get(name: string): string | null {
		const cookies = getCookies();
		return cookies.get(name) ?? null;
	}

	set(name: string, value: string, opts?: SetOptions): void {
		const setCookie = { name, value, path: '/', ...opts };

		document.cookie = setCookieToString(setCookie);
	}

	remove(name: string, opts?: RemoveOptions): void {
		this.set(name, '', { ...opts, maxAge: 0 });
	}
}

function getCookies(): Map<string, string> {
	return parseCookies(document.cookie);
}
