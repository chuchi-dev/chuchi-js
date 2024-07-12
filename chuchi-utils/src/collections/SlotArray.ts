/**
 * Implements a slot array data structure.
 */
export default class SlotArray<T> {
	inner: (T | null)[];
	free: number[];

	/**
	 * Creates a new instance of SlotArray.
	 */
	constructor() {
		this.inner = [];
		this.free = [];
	}

	/**
	 * Inserts a value into the array. If there are free slots, the value is
	 * inserted into one of them.
	 * Otherwise, it's appended to the end of the array.
	 *
	 * @param val - The value to be inserted.
	 * @returns The index at which the value was inserted.
	 */
	push(val: T): number {
		let id = this.free.pop();
		if (typeof id === 'number') {
			this.inner[id] = val;
		} else {
			id = this.inner.length;
			this.inner.push(val);
		}

		return id;
	}

	/**
	 * Returns all non-null items in the array.
	 *
	 * @returns An array of all non-null items in the array.
	 */
	all(): T[] {
		return this.inner.filter(f => f !== null) as T[];
	}

	/**
	 * Returns all non-null items in the array, along with their indices.
	 *
	 * @returns An array of tuples, where each tuple consists
	 * of an index and the corresponding non-null item.
	 */
	entries(): [number, T][] {
		return this.inner
			.map((v, i) => [i, v])
			.filter(([_, v]) => v !== null) as [number, T][];
	}

	/**
	 * Retrieves the item at the given index.
	 *
	 * @param id - The index to retrieve the item from.
	 * @returns The item at the given index, or null if no item is present.
	 */
	get(id: number): T | null {
		return this.inner[id] ?? null;
	}

	/**
	 * Removes the item at the given index, making its slot available for future
	 * insertions.
	 *
	 * @param id - The index to remove the item from.
	 */
	remove(id: number) {
		if (this.inner.length <= id) return;

		this.inner[id] = null;
		this.free.push(id);
	}
}
