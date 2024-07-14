import { padZero } from 'chuchi-utils';
import { fromAny } from './localization.js';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function isDateObject(val: any): val is Date {
	return typeof (val ? val.__isDateObject__ : null) === 'function';
}

/**
 * Class representing a Date object
 * @class
 * @exports time/date/Date
 * */
export default class Date {
	raw: globalThis.Date;

	static __parsetype__() {}
	__isDateObject__() {}

	/**
	 * Tries to creates a new Date instance
	 */
	static parse(val: any): Date {
		if (
			typeof val !== 'string' &&
			typeof val !== 'number' &&
			!isDateObject(val)
		)
			throw new Error('expected a string or a number');

		return new Date(val);
	}

	/**
	 * Create a new Date instance
	 * @constructor
	 * @param date - The date value. Default is
	 * current date.
	 * If it's a string or number, convert it to a date.
	 * @throws Will throw an error if date is an invalid Date.
	 */
	constructor(
		date:
			| Date
			| globalThis.Date
			| string
			| number
			| null
			| undefined = null,
	) {
		if (typeof date === 'undefined' || date === null) {
			this.raw = new globalThis.Date();
			this.raw.setHours(0, 0, 0, 0);
			return;
		}

		if (isDateObject(date)) {
			date = date.raw;
		}

		if (date instanceof globalThis.Date) {
			this.raw = date;
			return;
		}

		this.raw = new globalThis.Date(date);

		// @ts-ignore
		if (isNaN(this.raw)) {
			throw new Error('invalid Date');
		}
	}

	/**
	 * Check if the date represented by this instance is today
	 * @returns True if the date represented by this instance is
	 * today, otherwise false
	 */
	isToday(): boolean {
		const today = new Date();
		return (
			this.year == today.year &&
			this.month == today.month &&
			this.date == today.date
		);
	}

	/**
	 * Get the year from the date ex: 2023
	 * @returns {number} The year in which the date occurs
	 */
	get year(): number {
		return this.raw.getFullYear();
	}

	/**
	 * Get the month from the date (0 indexed)
	 * @returns {number} The month in which the date occurs, zero-indexed
	 */
	get month(): number {
		return this.raw.getMonth();
	}

	/**
	 * Get the date (day of the month 1-31)
	 * @returns {number} The day of the month on which the date occurs
	 */
	get date(): number {
		return this.raw.getDate();
	}

	/**
	 * Get the week of the year
	 * @returns {number} The week of the year in which the date occurs
	 */
	get week(): number {
		const nearestThursday = this.clone();
		nearestThursday.raw.setDate(this.date + 4 - this.dayMoToSu);
		const firstDay = new Date(new globalThis.Date(this.year, 0, 1));
		const days = (nearestThursday.time - firstDay.time) / DAY_IN_MS;
		return Math.ceil((days + 1) / 7);
	}

	/**
	 * Get the day of the week (0 indexed)
	 * @returns {number} The day of the week on which the date occurs,
	 * zero-indexed with 0 for Sunday
	 */
	get day(): number {
		return this.raw.getDay();
	}

	/**
	 * Get the day of the week (1 indexed with Monday as 1)
	 * @returns {number} The day of the week on which the date occurs, with 1
	 * for Monday and 7 for Sunday
	 */
	get dayMoToSu(): number {
		return this.day || 7;
	}

	/**
	 * Get the number of milliseconds since 1 January 1970 00:00:00 UTC
	 * @returns {number} The number of milliseconds since the Unix Epoch
	 */
	get time(): number {
		return this.raw.getTime();
	}

	/**
	 * Create a new Date object representing the same day
	 * @returns {Date} A new Date object with the same year, month, and
	 * date
	 */
	clone(): Date {
		return new Date(new globalThis.Date(this.year, this.month, this.date));
	}

	/**
	 * Get the name of the month in a given language
	 * @param {string|null} lang - The language to get the month name in
	 * @returns {string|null} The name of the month in the given language,
	 * or null if the language is not provided
	 */
	toStrMonth(lang: string | null = null): string | null {
		const l = fromAny(lang);
		return (l && l.months[this.month]) ?? null;
	}

	/**
	 * Get the name of the day in a given language
	 * @param {string|null} lang - The language to get the day name in
	 * @returns {string|null} The name of the day in the given language,
	 * or null if the language is not provided
	 */
	toStrDay(lang: string | null = null): string | null {
		const l = fromAny(lang);
		return (l && l.days[this.day]) ?? null;
	}

	/**
	 * Get the first letter of the day in a given language, in uppercase
	 * @param {string|null} lang - The language to get the day name in
	 * @returns {string|null} The first letter of the day in the given
	 * language, or null if the language is not provided
	 */
	toStrDayLetter(lang: string | null = null): string | null {
		const l = fromAny(lang);
		return (l && l.daysLetter[this.day]) ?? null;
	}

	/**
	 * Get a short representation of the date (dd.mm)
	 * @returns {string} A string representing the date in the form dd.mm
	 */
	toStrShort(): string {
		return `${padZero(this.date)}.${padZero(this.month + 1)}`;
	}

	/**
	 * Get a representation of the date (dd.mm.yyyy)
	 * @returns {string} A string representing the date in the form dd.mm.yyyy
	 */
	toStr(): string {
		const month = padZero(this.month + 1);
		return `${padZero(this.date)}.${month}.${this.year}`;
	}

	/**
	 * Get a representation of the date suitable for a browser (yyyy-mm-dd)
	 * @returns {string} A string representing the date in the form yyyy-mm-dd
	 */
	toBrowserDate(): string {
		const month = padZero(this.month + 1);
		return `${this.year}-${month}-${padZero(this.date)}`;
	}

	toJSON(): string {
		return this.toBrowserDate();
	}
}
