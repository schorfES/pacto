const __refs = new WeakMap();


class Resolver {

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

	add(key, value) {
		const {register} = __refs.get(this);
		register[key] = value;
		return this;
	}

	remove(key) {
		const {register} = __refs.get(this);
		register[key] = undefined;
		delete(register[key]);
		return this;
	}

	get(key) {
		const {register} = __refs.get(this);
		return register[key];
	}

	has(key) {
		return !!this.get(key);
	}

}


class Actions extends Resolver {

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
				actions.forEach((action) => action.call(null, event, context));
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
		const
			refs = __refs.get(this),
			{context, onAction} = refs,
			registered = this.get(type)
		;

		if (registered && registered.length) {
			if (!(actions instanceof Array)) {
				actions = [actions];
			}

			actions.forEach((action) => {
				const index = registered.indexOf(action);
				if (index > -1) {
					registered.splice(index, 1);
				}
			});

			if (registered.length === 0) {
				return super.remove(type);
			}
		}

		return this;
	}

}

class Values extends Resolver {};

class Context extends EventEmitter {

	constructor() {
		super();
		__refs.set(this, {
			actions: new Actions(this),
			values: new Values(this)
		});
	}

	get actions() {
		return __refs.get(this).actions;
	}

	get values() {
		return __refs.get(this).values;
	}

}
