/** @module utils */

/**
 * Delays for a specified amount of time.
 *
 * @param ms - The number of milliseconds to delay for.
 * @returns A promise that resolves after the delay.
 */
export function timeout(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Comparison function for sorting in descending order.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns -1 if a > b, 1 if b > a, 0 otherwise.
 */
export function sortToLower(a: any, b: any): number {
	if (a > b) return -1;
	else if (b > a) return 1;
	return 0;
}

/**
 * Comparison function for sorting in ascending order.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @returns 1 if a > b, -1 if b > a, 0 otherwise.
 */
export function sortToHigher(a: any, b: any): number {
	if (a > b) return 1;
	else if (b > a) return -1;
	return 0;
}

/**
 * Pads a value with leading zeros until it reaches a specified length.
 *
 * @param val - The value to pad.
 * @param length - The desired length of the padded value.
 * @returns The padded value as a string.
 */
export function padZero(val: any, length: number = 2): string {
	// make val a string
	val += '';
	if (val.length >= length) return val;

	let prev = '';
	for (let i = val.length; i < length; i++) {
		prev += '0';
	}

	return prev + val;
}

export const ALPHABET: string =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const ALPHABET_LENGTH = ALPHABET.length;

/**
 * Generates a random token of a specified length.
 *
 * @param length - The desired length of the token.
 * @returns A random token.
 */
export function randomToken(length: number = 8): string {
	let s = '';
	for (let i = 0; i < length; i++) {
		s += ALPHABET[Math.floor(Math.random() * ALPHABET_LENGTH)];
	}
	return s;
}

/**
 * Creates an array of whole numbers in a specified range.
 *
 * @param start - The start of the range.
 * @param end - The end of the range (exclusive).
 * @param step - The step size between values, defaults to 1.
 * @returns The generated array.
 */
// todo improve this function
export function range(start: number, end: number, step: number = 1): number[] {
	const len = end - start / step;
	const ar = new Array(len);
	let c = 0;
	for (let i = start; i < end; i += step) {
		ar[c] = i;
		c += 1;
	}
	return ar;
}

/**
 * Shuffles an array and returns it.
 * Does not modify the original array.
 *
 * @param arr - The array to shuffle.
 * @returns The shuffled array.
 */
export function shuffle<T>(arr: T[]): T[] {
	const ar = arr.slice();
	for (let i = ar.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[ar[i], ar[j]] = [ar[j], ar[i]];
	}
	return ar;
}

/**
 * Selects a random element from an array, or returns null if the array is
 * empty.
 *
 * @param arr - The array to select from.
 * @returns A random element from the array, or null.
 */
export function randomEl<T>(arr: T[]): T | null {
	if (arr.length === 0) return null;

	const i = Math.floor(Math.random() * arr.length);
	return arr[i];
}

/**
 * Calculates the sum of all numbers in an array.
 *
 * @param ar - The array of numbers to sum.
 * @returns The sum of all numbers in the array.
 */
export function sum(ar: number[]): number {
	return ar.reduce((a, b) => a + b, 0);
}
