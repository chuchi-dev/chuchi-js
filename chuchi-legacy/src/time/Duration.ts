import type DateTime from './DateTime.js';
import { type Localization, fromAny } from './localization.js';

export default class Duration {
	millis: number;

	/**
	 * Create a new Duration instance
	 *
	 * @param duration - The duration in milliseconds
	 */
	constructor(millis: number) {
		// + is in the future - is in the past
		this.millis = millis;
	}

	/**
	 * Calculate the duration between two dates
	 *
	 * @param {DateTime} from - The start date
	 * @param {DateTime} to - The end date
	 */
	static from(from: DateTime, to: DateTime): Duration {
		return new Duration(to.time - from.time);
	}

	/**
	 * Calculate the duration from now to a date
	 *
	 * @param {DateTime} to - The end date
	 */
	static toNow(to: DateTime): Duration {
		return new Duration(to.time - Date.now());
	}

	get seconds(): number {
		return this.millis / 1000;
	}

	get minutes(): number {
		return this.seconds / 60;
	}

	get hours(): number {
		return this.minutes / 60;
	}

	get days(): number {
		return this.hours / 24;
	}

	get weeks(): number {
		return this.days / 7;
	}

	/// returns null if lang is undefined or days < 1
	toStrByDays(lang: string | Localization | null = null): string | null {
		// month is maybe not always accurate
		let days = this.days;
		const l = fromAny(lang);
		if (l === null) return null;
		const words = l.intWords;

		let pre = words.afterGram;
		if (days < 0) {
			pre = words.beforeGram;
			days *= -1;
		}

		if (days < 1) return null;
		if (days < 7) return intInfo(pre, days, words.day);
		if (days < 30) return intInfo(pre, days / 7, words.week);
		if (days < 30 * 12) return intInfo(pre, days / 30, words.month);
		return intInfo(pre, days / (30 * 12), words.year);
	}

	/// lang can be a string or a lang item (see localization.js)
	/// if null == uses default set in localization
	toStr(lang: string | null = null): string | null {
		const l = fromAny(lang);
		if (l === null) return null;
		const words = l.intWords;

		if (Math.abs(this.days) >= 1) return this.toStrByDays(l);

		let secs = this.seconds;
		let pre = words.afterGram;
		if (secs < 0) {
			pre = words.beforeGram;
			secs *= -1;
		}

		if (secs < 60) return intInfo(pre, secs, words.second);
		if (secs < 60 * 60) return intInfo(pre, secs / 60, words.minute);

		// because days > 1 get filtered out before
		// this must be in hours
		return intInfo(pre, secs / (60 * 60), words.hour);
	}
}

// int = intelligent
function intInfo(
	gram: (num: string | number, unit: string) => string,
	num: number,
	[oneUnit, one, many]: [string, string, string],
): string {
	num = Math.round(num);
	let num2: number | string = num;
	if (num <= 1) {
		num2 = oneUnit;
		many = one;
	}
	return gram(num2, many);
}
