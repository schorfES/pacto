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

	add(namespace, value) {
		const {register} = __refs$3.get(this);
		register[namespace] = value;
		return this;
	}

	remove(namespace) {
		const {register} = __refs$3.get(this);
		register[namespace] = undefined;
		delete(register[namespace]);
		return this;
	}

	get(namespace) {
		const {register} = __refs$3.get(this);
		return register[namespace];
	}

	has(namespace) {
		return !!this.get(namespace);
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

function __isFalse(value) {
	return typeof value === 'boolean' && !value;
}

function __getSettings(instance) {
	const settings = instance.settings;

	if (!settings || typeof settings !== 'object') {
		throw new Error('Define settings object');
	}

	if (!settings.view) {
		throw new Error('Define a view');
	}

	if (!settings.selector) {
		throw new Error('Define a selector');
	}

	if (!settings.namespace) {
		throw new Error('Define a namespace');
	}

	return settings;
}


class Initialize {

	get settings() {
		return null;
	}

	run() {
		const
			settings = __getSettings(this),
			{context, event} = this,
			{data} = event,
			views = context.values.get(settings.namespace) || [],
			root = data && data.root ? data.root : document.body
		;

		let result;

		result = this.beforeAll();
		if (__isFalse(result)) {
			return;
		}

		[...root.querySelectorAll(settings.selector)].forEach((el, index) => {
			if (views.some((view) => view.el === el)) {
				return;
			}

			const options = {el, context, ...settings.params};
			let view = null;

			result = this.beforeEach(options, el, index);
			if (__isFalse(result)) {
				return;
			}

			view = new settings.view(options);
			view.render();

			result = this.afterEach(view, el, index);
			if (__isFalse(result)) {
				return;
			}

			views.push(view);
		});

		if (views.length > 0) {
			context.values.add(settings.namespace, views);
		}

		this.afterAll(views);
	}

	beforeAll() {
		// Overwrite this...
	}

	beforeEach(/* options, el, index */) {
		// Overwrite this...
	}

	afterEach(/* view, el, index */) {
		// Overwrite this...
	}

	afterAll(/* views */) {
		// Overwrite this...
	}

}

function __getSettings$1(instance) {
	const settings = instance.settings;

	if (!settings || typeof settings !== 'object') {
		throw new Error('Define settings object');
	}

	if (!settings.selector) {
		throw new Error('Define a selector');
	}

	return settings;
}


class InitializeLazy {

	constructor() {
		this._onIntersect = this._onIntersect.bind(this);
	}

	get settings() {
		return null;
	}

	get import() {
		return null;
	}

	get observerSettings() {
		return {
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		};
	}

	run() {
		const settings = __getSettings$1(this);
		this._lookup(settings.selector);
	}

	_lookup(selector) {
		const
			{event} = this,
			{data} = event,
			root = data && data.root ? data.root : document.body,
			elements = root.querySelectorAll(selector)
		;

		if (elements.length === 0) {
			return;
		}

		if (window.IntersectionObserver) {
			this._observe(elements);
		} else {
			this._fetch();
		}
	}

	_observe(elements) {
		this._observer = new window.IntersectionObserver(this._onIntersect, this.observerSettings);
		[...elements].forEach((element) => this._observer.observe(element));
	}

	_disconnect() {
		this._observer.disconnect();
		this._observer = null;
	}

	_fetch() {
		const {event} = this;

		this.import.then((module) => {
			const Action = module.Action || module.default;
			let error = null;

			if (!Action) {
				error = new Error('Module must export Action or default');
				this.context.trigger(this.event.type + ':error', {error}); // Only for testing reasons
				throw error;
			}

			if (!(typeof Action.prototype.run === 'function')) {
				error = new Error('Module must be an Action');
				this.context.trigger(this.event.type + ':error', {error}); // Only for testing reasons
				throw error;
			}

			// Replace the proxy action with the loaded action
			this.context.actions
				.add(event.type, Action)
				.remove(event.type, this.constructor);

			// Execute the current action:
			this._execute(Action);
		});
	}

	_execute(Action) {
		const action = new Action();
		action.context = this.context;
		action.event = this.event;
		action.run();
	}

	_onIntersect(entries) {
		const isVisible = entries.some((entry) => entry.isIntersecting);

		if (isVisible) {
			this._disconnect();
			this._fetch();
		}
	}

}

class View extends EventEmitter {

	constructor(options) {
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
