import { range } from './index.js';

/**
 * returns expects a hex value with 6 values `rgba(0,0,0,a)`
 */
export function toRgba(color: string, alpha: number = 1): string {
	color = color.trim();
	if (!color.startsWith('#') || color.length !== 7)
		throw new Error('expected a hex value with 6 characters');

	const hex = color.substring(1);

	const values = range(0, 3)
		.map(i => parseInt(hex.substring(i * 2, i * 2 + 2), 16))
		.concat([alpha]);

	return `rgba(${values.join()})`;
}
