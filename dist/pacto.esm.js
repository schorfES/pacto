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

function __isBoolean(value) {
	return typeof value === 'boolean';
}


class Initialize {

	get settings() {
		return {};
	}

	run() {
		this.beforeAll();

		const
			{context, event, settings} = this,
			{data} = event,
			{viewoptions} = settings,
			views = context.values.get(settings.namespace) || [],
			root = data && data.root ? root : document.body
		;

		if (!settings.viewclass) {
			throw new Error('Define a view class');
		}

		if (!settings.selector) {
			throw new Error('Define a selector');
		}

		if (!settings.namespace) {
			throw new Error('Define a namespace');
		}

		[...root.querySelectorAll(settings.selector)].forEach((el, index) => {
			const options = {el, context, ...viewoptions};
			let
				result = null,
				view = null
			;

			result = this.beforeEach(options, el, index);
			if (!__isBoolean(result)) {
				throw new Error('The return value of beforeEach() must be a boolean.');
			} else if (!result) {
				return;
			}

			view = new settings.viewclass(options).render();

			result = this.afterEach(view, el, index);
			if (!__isBoolean(result)) {
				throw new Error('The return value of afterEach() must be a boolean.');
			} else if (!result) {
				return;
			}

			views.push(view);
		});

		if (views.length) {
			context.values.add(settings.namespace, views);
		}

		this.afterAll();
	}

	beforeAll() {
		// Overwrite this...
	}

	beforeEach(/* options, element, index */) {
		// Overwrite this...
		return true;
	}

	afterAll() {
		// Overwrite this...
	}

	afterEach(/* view, element, index */) {
		// Overwrite this...
		return true;
	}

}

class InitializeLazy {

	constructor() {
		this._onIntersect = this._onIntersect.bind(this);
		this._fetched = false;
	}

	get settings() {
		return {};
	}

	get import() {
		return null;
	}

	get observerSettings() {
		return {
			rootMargin: '0px',
			threshold: [0.0001, 0.9999]
		};
	}

	run() {
		const {settings} = this;

		if (!settings.selector) {
			throw new Error('Define a selector');
		}

		this._lookup(settings.selector);
	}

	_lookup(selector) {
		const
			{event} = this,
			{data} = event,
			root = data && data.root ? root : document.body,
			elements = root.querySelectorAll(selector)
		;

		if (elements.length) {
			if (window.IntersectionObserver) {
				this._observe(elements);
			} else {
				this._fetch();
			}
		}
	}

	_observe(elements) {
		this._observers = [...elements].map((element) => {
			const observer = new window.IntersectionObserver(
				this._onIntersect,
				this.observerSettings
			);

			observer.observe(element);
			return observer;
		});
	}

	_release() {
		if (this._observers && this._observers.length) {
			this._observers.forEach((observer) => observer.disconnect());
			this._observers = null;
		}
	}

	_fetch() {
		const {event} = this;

		if (this._fetched) {
			return;
		}

		this._fetched = true;
		this.import.then((module) => {
			const Initialize = module.Action || module.default;

			if (!Initialize) {
				throw new Error('Module must return Action or default');
			}

			if (!(typeof Initialize.prototype.run === 'function')) {
				throw new Error('Module must be an Action');
			}

			// Replace the proxy action with the loaded action
			this.context.actions
				.add(event.type, Initialize)
				.remove(event.type, this.constructor);

			// Execute the current action:
			this._execute(Initialize);
		});
	}

	_execute(Initialize) {
		const action = new Initialize();
		action.context = this.context;
		action.event = this.event;
		action.run();
	}

	_onIntersect(entries) {
		let isVisible = false;
		entries.forEach((entry) => isVisible = entry.intersectionRatio > 0 || isVisible);

		if (isVisible) {
			this._release();
			this._fetch();
		}
	}

}

class View extends EventEmitter {

	constructor(options = {}) {
		super();
		this.options = options;
		this.context = options.context;
		this.el = options.el;
	}

	render() {
		return this;
	}

	destroy() {
		this.options = null;
		this.context = null;
		this.el = null;
		return this;
	}

}

export { Collection, Context, EventEmitter, Initialize, InitializeLazy, Model, View };
