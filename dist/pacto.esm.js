const __refs = new WeakMap();


class EventEmitter {

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

const __refs$1 = new WeakMap();


class Model extends EventEmitter {

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

		__refs$1.set(this, proxy);
	}

	get defaults() {
		return null;
	}

	get props() {
		return __refs$1.get(this);
	}

}

const __refs$2 = new WeakMap();


class Collection extends EventEmitter {

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

		__refs$2.set(this, proxy);
	}

	get Model() {
		return Model;
	}

	get models() {
		return __refs$2.get(this);
	}

}

const __refs$3 = new WeakMap();


class __Resolver {

	constructor(context) {
		const
			register = {},
			refs = {
				context,
				register
			}
		;

		__refs$3.set(this, refs);
	}

	add(key, value) {
		const {register} = __refs$3.get(this);
		register[key] = value;
		return this;
	}

	remove(key) {
		const {register} = __refs$3.get(this);
		register[key] = undefined;
		delete(register[key]);
		return this;
	}

	get(key) {
		const {register} = __refs$3.get(this);
		return register[key];
	}

	has(key) {
		return !!this.get(key);
	}

}


class __Actions extends __Resolver {

	constructor(context) {
		super(context);
		const
			refs = __refs$3.get(this),
			{register} = refs
		;

		refs.onAction = (event) => {
			const
				{type} = event,
				actions = register[type]
			;

			if (actions) {
				actions.forEach((Action) => {
					var action = new Action();
					action.context = context;
					action.event = event;
					action.run();
				});
			}
		};
	}

	add(type, actions) {
		const
			refs = __refs$3.get(this),
			{context, onAction} = refs,
			registered = this.get(type)
		;

		if (!registered) {
			context.on(type, onAction);
		}

		actions = (registered || []).concat(actions);
		return super.add(type, actions);
	}

	remove(type, actions) {
		const registered = this.get(type);

		if (registered && registered.length) {
			if (!actions) {
				return super.remove(type);
			}

			if (!(actions instanceof Array)) {
				actions = [actions];
			}

			actions.forEach((action) => {
				let index = registered.indexOf(action);
				while (index > -1) {
					registered.splice(index, 1);
					index = registered.indexOf(action);
				}
			});

			if (registered.length === 0) {
				return super.remove(type);
			}
		}

		return this;
	}

}


class Context extends EventEmitter {

	constructor() {
		super();
		__refs$3.set(this, {
			actions: new __Actions(this),
			values: new __Resolver(this)
		});
	}

	get actions() {
		return __refs$3.get(this).actions;
	}

	get values() {
		return __refs$3.get(this).values;
	}

}

export { Collection, Context, EventEmitter, Model };
