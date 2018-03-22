import {EventEmitter} from './EventEmitter';
import {Model} from './Model';


const __refs = new WeakMap();


export class Collection extends EventEmitter {

	constructor(models = []) {
		super();

		const
			enshureIsModel = (model) =>
				(model instanceof Model) ? model : new this.Model(model),
			handler = {
				get: (target, property) => {
					const method = target[property];

					if (typeof method === 'function') {
						return (...args) => {
							let
								isChanged = false,
								result
							;

							switch (property) {
								case 'pop':
								case 'reverse':
								case 'shift':
								case 'sort':
									isChanged = true;
									break;

								case 'fill':
									isChanged = true;
									args[0] = enshureIsModel(args[0]);
									break;

								case 'push':
								case 'unshift':
									isChanged = true;
									args = args.map(enshureIsModel);
									break;

								case 'splice':
									isChanged = true;
									args = args.map((arg, index) =>
										(index > 1) ? enshureIsModel(arg) : arg);
									break;
							}

							result = method.apply(target, args);

							if (isChanged) {
								this.trigger('change', {method: property});
							}

							return result;
						};
					}

					return method;
				}
			},
			proxy = new Proxy(models.map(enshureIsModel), handler)
		;

		__refs.set(this, proxy);
	}

	get Model() {
		return Model;
	}

	get models() {
		return __refs.get(this);
	}

}
