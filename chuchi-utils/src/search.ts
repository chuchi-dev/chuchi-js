/**
 * Checks how closely a search string matches a value, and returns a score
 * representing the match quality.
 *
 * @param search - The search string.
 * @param val - The value to check for a match.
 * @returns 0 if no match, 1+ if there was a match (lower is better).
 */
export function searchScore(search: string, val: string): number {
	if (search.length === 0) return 0;

	search = search.normalize('NFKD').toLowerCase();
	val = val.normalize('NFKD').toLowerCase();

	const i = val.indexOf(search);
	// search not found in val
	if (i === -1) return 0;

	const distLeft = searchSpaceLeft(i, val);
	const distRight = searchSpaceLeft(i + search.length, val);

	return 1 + distLeft + distRight;
}

// calculate distance to space left of
function searchSpaceLeft(idx: number, val: string): number {
	let dist = 0;
	while (idx > 0) {
		idx--;
		if (val[idx] === ' ') return dist;

		dist++;
	}
	return dist;
}

// calculate distance to space right of
// todo is this used???
// @ts-ignore
/* eslint-disable @typescript-eslint/no-unused-vars */
function searchSpaceRight(idx: number, val: string): number {
	let dist = 0;
	while (idx < val.length - 1) {
		idx++;
		if (val[idx] === ' ') return dist;

		dist++;
	}
	return dist;
}
