import Listeners from 'chuchi-utils/sync/Listeners';

export default class Writable<T> {
	private inner: T;
	private listeners: Listeners<[T]>;

	/**
	 * Creates a new instance of Writable.
	 *
	 * @param value The initial value to be stored.
	 */
	constructor(value: T) {
		this.inner = value;
		this.listeners = new Listeners();
	}

	/**
	 * Subscribes a listener to changes in the stored value.
	 *
	 * @param listener The function to be added as a listener. It should accept the stored value as its only argument.
	 * @returns A function that, when called, will remove the added listener from the set.
	 */
	subscribe(fn: (value: T) => void): () => void {
		fn(this.inner);
		return this.listeners.add(fn);
	}

	/**
	 * Returns the stored value.
	 */
	get(): T {
		return this.inner;
	}

	/**
	 * Sets the stored value to the given value and notifies all subscribed listeners.
	 */
	set(inner: T) {
		this.inner = inner;
		this.listeners.trigger(inner);
	}

	/**
	 * Sets the stored value without notifying any subscribed listeners.
	 */
	setSilent(inner: T) {
		this.inner = inner;
	}

	/**
	 * Notifies all subscribed listeners of a change in the stored value.
	 */
	notify() {
		this.listeners.trigger(this.inner);
	}
}
