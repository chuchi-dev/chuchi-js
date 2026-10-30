import ClientCookies from './ClientCookies.js';
import ServerCookies from './ServerCookies.js';

export type SetOptions = {
	maxAge?: number;
	path?: string;
	domain?: string;
	secure?: boolean;
	httpOnly?: boolean;
};

export type RemoveOptions = Omit<SetOptions, 'maxAge'>;

export interface Cookies {
	/**
	 * returns the value of the cookie
	 */
	get(name: string): string | null;

	/**
	 * sets the value of the cookie
	 *
	 * #### Note
	 * path defaults to '/'
	 */
	set(name: string, value: string, opts?: SetOptions): void;

	/**
	 * removes the cookie
	 *
	 * Pass the same path and domain the cookie was set with.
	 */
	remove(name: string, opts?: RemoveOptions): void;

	// doc hidden
	_init(cookies: string): void;
}

export { ClientCookies, ServerCookies };
