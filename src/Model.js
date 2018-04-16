import {EventEmitter} from './EventEmitter';


const __refs = new WeakMap();


/**
 * The Model
 *
 * @class
 * @module Context
 * @extends EventEmitter
 */
export class Model extends EventEmitter {

	constructor(props = {}) {
		super();
		props = {...this.defaults, ...props};

		const
			handler = {
				set: (target, property, value) => {
					const isChanged = target[property] !== value;
					target[property] = value;

					if (isChanged) {
						this.trigger('change', {prop: property, value: value});
					}

					return true;
				}
			},
			proxy = new Proxy(props, handler)
		;

		__refs.set(this, proxy);
	}

	get defaults() {
		return null;
	}

	get props() {
		return __refs.get(this);
	}

}
