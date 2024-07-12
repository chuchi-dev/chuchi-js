/**
 * An error returned from the API
 */
export default class ApiError {
	/**
	 * The kind of error
	 */
	kind: string;

	/**
	 * The data associated with this error
	 *
	 * should provide a toString method
	 */
	data: any;

	/*
	fields:
		- kind: str,
		- data: any // if it has a toString (it will be stored it in the msg)
	*/
	/**
	 * Creates a new ApiError
	 */
	constructor(kind: string, data: any) {
		this.kind = kind;
		this.data = data;
	}

	/**
	 * The message of the error
	 *
	 * @returns
	 */
	get msg(): string {
		if (this.data && typeof this.data.toString === 'function')
			return this.data.toString();
		return '';
	}

	__isApiErrorObject__() {}

	/// expects either
	/// str
	/// { 'kind': data }
	/// { kind, data }
	static fromJson(obj: any): ApiError {
		if (typeof obj === 'string') return new ApiError(obj, null);

		// {kind, data}
		if ('kind' in obj) return new ApiError(obj.kind, obj?.data ?? null);

		// {'kind': data}
		const [kind, data] = Object.entries(obj)[0];
		return new ApiError(kind, data);
	}

	/**
	 * Creates a new ApiError with the kind 'OTHER'
	 */
	static newOther(data: any): ApiError {
		return new ApiError('OTHER', data);
	}

	/**
	 * Creates a new ApiError with the kind 'SESSION_NOT_FOUND'
	 */
	static newSessionError(): ApiError {
		return new ApiError('SESSION_NOT_FOUND', 'no session');
	}

	/**
	 * Returns a string representation of the error
	 */
	toString(): string {
		return `${this.kind}: ${this.msg}`;
	}
}

/**
 * Returns whether the value is an ApiError object
 */
export function isApiErrorObject(val: any): boolean {
	return typeof (val ? val.__isApiErrorObject__ : null) === 'function';
}
