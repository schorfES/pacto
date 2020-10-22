const __refs = new WeakMap();


// @TODO: Document
/**
 * The event emitter class.
 *
 * @public
 * @type {EventEmitter}
 */
export class EventEmitter {

	constructor() {
		__refs.set(this, {});
	}

	on(type, callback) {
		const refs = __refs.get(this);

		refs[type] = refs[type] || [];
		refs[type].push(callback);

		return this;
	}

	off(type, callback) {
		const refs = __refs.get(this);

		if (!refs[type]) {
			return this;
		}

		if (callback) {
			refs[type] = refs[type].filter(cb => cb !== callback);
		} else {
			refs[type] = [];
		}

		return this;
	}

	trigger(type, data = null) {
		const refs = __refs.get(this);

		refs[type] && refs[type].forEach((callback) => callback.call(null, {
			sender: this,
			type,
			data
		}));

		return this;
	}

}
