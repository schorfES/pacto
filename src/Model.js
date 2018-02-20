import {EventEmitter} from './EventEmitter';


const __propsMap = new WeakMap();


export class Model extends EventEmitter {

	constructor(props = {}) {
		super();

		const
			handler = {
				set: (target, property, value) => {
					let isChanged = target[property] !== value;
					target[property] = value;

					if (isChanged) {
						this.trigger('change', {prop: property, value: value});
					}
				}
			},
			proxy = new Proxy(props, handler)
		;

		__propsMap.set(this, proxy);
	}

	get props() {
		return __propsMap.get(this);
	}

}
