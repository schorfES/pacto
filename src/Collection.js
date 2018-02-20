const __modelsMap = new WeakMap();


class Collection extends EventEmitter {

	constructor(models = []) {
		super();

		const
			enshureIsModel = (model) =>
				(model instanceof Model) ? model : new this.Model(model),
			handler = {
				get: (target, property) => {
					const method = target[property];

					return (...args) => {
						let
							isChanged = false,
							result
						;

						switch (property) {
							case 'pop':
							case 'shift':
							case 'reverse':
							case 'sort':
								isChanged = true;
								break;

							case 'fill':
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
			},
			proxy = new Proxy(models.map(enshureIsModel), handler)
		;

		__modelsMap.set(this, proxy);
	}

	get Model() {
		return Model;
	}

	get models() {
		return __modelsMap.get(this);
	}

}
