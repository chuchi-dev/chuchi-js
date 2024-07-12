import ApiError from '../api/ApiError.js';

export type GraphQlErrorObject = {
	message: string;
	extensions?: any;
	locations?: any;
};

export default class GraphQlError {
	kind: string;
	errors: GraphQlErrorObject[];
	data: unknown;

	/*
    fields:
        - kind: str,
        - errors: should be one of the following
          "error message"
          { message, ?extensions, ?locations }
          [{ message, ?extensions, ?locations }]
        - data: graphql data if it is available

        extensions might contain apiError
    */
	constructor(
		kind: string,
		errors: GraphQlErrorObject[] | string | GraphQlErrorObject,
		data: unknown = null,
	) {
		this.kind = kind;

		if (typeof errors === 'string') {
			errors = [{ message: errors }];
		} else if (!Array.isArray(errors)) {
			errors = [errors];
		}

		this.errors = errors;
		this.data = data;
	}

	static fromJson(json: any) {
		let apiError = json.errors.find((e: any) => !!e.extensions?.apiError);
		if (apiError)
			apiError = ApiError.fromJson(apiError.extensions.apiError);

		return new GraphQlError(
			apiError?.kind ?? 'Unknown',
			json.errors,
			json.data,
		);
	}

	static newOther(msg: string): GraphQlError {
		return new GraphQlError('Other', msg);
	}

	get msg(): string {
		return this.errors.map(e => e.message).join(', ');
	}

	toString(): string {
		return `${this.kind}: ${this.msg}`;
	}

	__isGraphQlErrorObject__() {}
}

export function isGraphQlErrorObject(val: any) {
	return typeof (val ? val.__isGraphQlErrorObject__ : null) === 'function';
}
