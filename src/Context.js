import {EventEmitter} from './EventEmitter';


const __refs = new WeakMap();


class __Resolver {

	constructor(context) {
		const
			register = {},
			refs = {
				context,
				register
			}
		;

		__refs.set(this, refs);
	}

	add(namespace, value) {
		const {register} = __refs.get(this);
		register[namespace] = value;
		return this;
	}

	remove(namespace) {
		const {register} = __refs.get(this);
		register[namespace] = undefined;
		delete(register[namespace]);
		return this;
	}

	get(namespace) {
		const {register} = __refs.get(this);
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
			refs = __refs.get(this),
			{register} = refs
		;

		refs.onAction = (event) => {
			const
				{type} = event,
				actions = register[type]
			;

			if (actions) {
				[].concat(actions).forEach((Action) => {
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
			refs = __refs.get(this),
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


export class Context extends EventEmitter {

	constructor(options = null) {
		super();

		const refs = {
			actions: new __Actions(this),
			values: new __Resolver(this),
			options
		}

		if (options && options.history) {
			// All triggered events will be stored here until they are flushed
			// away using flushHistroy():
			refs.history = [];
		}

		__refs.set(this, refs);
	}

	get actions() {
		return __refs.get(this).actions;
	}

	get values() {
		return __refs.get(this).values;
	}

	get history() {
		return __refs.get(this).history || null;
	}

	trigger(type, data = null) {
		const {history} = this;
		history && history.push({type, data});
		return super.trigger(type, data);
	}

	flushHistory() {
		const {history} = this;
		history && history.splice(0, history.length);
	}

}
