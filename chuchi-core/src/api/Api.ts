import ApiError from './ApiError.js';

const DEF_ORIGIN = 'http://fir_def';

/**
 * Api class to handle requests to a server
 */
export default class Api {
	/**
	 * get or set the api address
	 */
	addr: string;

	/**
	 * Creates a new Api instance
	 */
	constructor(addr: string) {
		this.addr = addr;
	}

	/**
	 * Prepares a json object to be sent as a header
	 */
	static jsonHeader(data: object): string {
		return encodeURIComponent(JSON.stringify(data));
	}

	/**
	 * Send a request to the server
	 *
	 * @param method - The method of the request
	 * @param path - The path of the request
	 * @param data - The data to be sent if the method is get the data will
	 * be sent as query params
	 * @param headers - The headers to be sent
	 * @param opts - The additional options to be sent to fetch
	 *
	 * @returns The response of the request
	 *
	 * @throws - If the request fails
	 */
	async request(
		method: string,
		path: string,
		data: object | null = null,
		headers: object = {},
		opts: any = {},
	): Promise<any> {
		let err;

		if (!this.addr) throw ApiError.newOther('Server addr not defined');

		// since URL does not accept an url with out a host we need to add
		// a default host, which we will remove later
		// the URL is used in the first place to allow to modify the
		// search params
		// todo: there might still be an issue with relative and absolute
		// paths, but i'm not sure fetch supports relative paths?
		const url = new URL(this.addr + path, DEF_ORIGIN);
		const isGet = method.toLowerCase() === 'get';
		if (isGet) setSearchParams(url, data);

		try {
			const fetchParams = {
				headers,
				method,
				...opts,
			};
			fetchParams.headers['content-type'] = 'application/json';

			// don't send a body if the method is get
			if (!isGet) fetchParams.body = JSON.stringify(data);

			const resp = await fetch(urlToString(url), fetchParams);

			opts.responseStatus = resp.status;
			opts.responseHeaders = resp.headers;

			// the body might be empty (204) or not json (an html error page)
			const text = await resp.text();
			let json = null;
			let isJson = true;
			try {
				json = text ? JSON.parse(text) : null;
			} catch (e) {
				if (resp.ok) throw e;
				isJson = false;
			}

			if (resp.ok) return json;

			// we've got and error
			err = isJson
				? ApiError.fromJson(json)
				: ApiError.newOther('response code ' + resp.status);
		} catch (e: any) {
			console.error('request error raw', e);
			err = ApiError.newOther(e.message);
		}

		console.error('request error', err);
		throw err;
	}

	/**
	 * Send a request to the server with a file
	 *
	 * @param method - The method of the request
	 * @param path - The path of the request
	 * @param file - The file to be sent
	 * @param progress - The progress callback
	 * @param headers - The headers to be sent
	 *
	 * @throws {ApiError} - If the request fails
	 */
	async requestWithFile(
		method: string,
		path: string,
		file: File,
		progress: ((percent: number) => void) | null = null,
		headers: Record<string, string> = {},
	): Promise<any> {
		const prog = progress ?? ((_percent: number) => {});

		if (!this.addr) throw ApiError.newOther('Server addr not defined');

		return new Promise((res, err) => {
			// use XMLHttpRequest since with fetch we cannot track the upload
			const req = new XMLHttpRequest();

			req.responseType = 'json';

			req.addEventListener('load', () => {
				prog(100);

				// should probably be a json object now
				if (isOk(req.status)) {
					res(req.response);
				} else {
					try {
						err(xhrError(req));
					} catch (e: any) {
						err(ApiError.newOther(e.message));
					}
				}
			});

			req.addEventListener('error', () => {
				console.error('requestWithFile network failure');
				err(ApiError.newOther('reuestWithFile network failure'));
			});

			// to manually 'estimate the progress';
			let prevProgress = 0;
			req.addEventListener('progress', e => {
				if (e.lengthComputable) {
					prog(Math.min((e.loaded / e.total) * 100, 100));
				} else {
					prevProgress += prevProgress >= 75 ? 5 : 25;
					prog(Math.min(prevProgress, 100));
				}
			});

			// open request
			req.open(method, this.addr + path);

			// add headers
			Object.entries(headers).forEach(([k, v]) => {
				req.setRequestHeader(k, v);
			});

			// send request
			req.send(file);
		});
	}

	/**
	 * Send a request to the server with a timeout
	 *
	 * @param method - The method of the request
	 * @param path - The path of the request
	 * @param data - The data to be sent
	 * @param headers - The headers to be sent
	 * @param timeout - The timeout of the request if the value is 0 there is no timeout
	 */
	async requestTimeout(
		method: string,
		path: string,
		data: object | null = null,
		headers: object = {},
		timeout: number = 0,
	): Promise<any> {
		if (!this.addr) throw ApiError.newOther('Server addr not defined');

		return new Promise((res, err) => {
			// use XMLHttpRequest since with fetch we cannot track the upload
			const req = new XMLHttpRequest();

			req.responseType = 'json';

			req.addEventListener('load', () => {
				// should probably be a json object now
				if (isOk(req.status)) {
					res(req.response);
				} else {
					try {
						err(xhrError(req));
					} catch (e: any) {
						err(ApiError.newOther(e.message));
					}
				}
			});

			req.addEventListener('timeout', () => {
				console.error('requested TimedOut');
				err(ApiError.newOther('requested TimedOut'));
			});

			req.addEventListener('error', () => {
				console.error('requestTimeout network failure');
				err(ApiError.newOther('requestTimeout network failure'));
			});

			// like request, get sends the data as query params
			const isGet = method.toLowerCase() === 'get';
			const url = new URL(this.addr + path, DEF_ORIGIN);
			if (isGet) setSearchParams(url, data);

			// open request
			req.open(method, urlToString(url));

			// add headers
			req.setRequestHeader('content-type', 'application/json');
			Object.entries(headers).forEach(([k, v]) => {
				req.setRequestHeader(k, v);
			});
			req.timeout = timeout;

			let body = null;
			// don't send a body if the method is get
			if (!isGet) {
				body = JSON.stringify(data);
			}

			// send request
			req.send(body);
		});
	}
}

function isOk(status: number): boolean {
	return status >= 200 && status < 300;
}

function setSearchParams(url: URL, data: object | null) {
	for (const [key, value] of Object.entries(data ?? {})) {
		if (value !== undefined && value !== null)
			url.searchParams.set(key, value);
	}
}

function urlToString(url: URL): string {
	const urlStr = url.toString();
	if (urlStr.startsWith(DEF_ORIGIN))
		return urlStr.substring(DEF_ORIGIN.length);
	return urlStr;
}

function xhrError(req: XMLHttpRequest): ApiError {
	// the response is null if it was not json
	if (req.response === null)
		return ApiError.newOther('response code ' + req.status);
	return ApiError.fromJson(req.response);
}
