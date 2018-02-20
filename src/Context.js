const
	__actionsRefsMap = new WeakMap(),
	__valuesMap = new WeakMap()
;


class Actions {

	constructor(context) {
		const
			register = {},
			onAction = (event) => {
				const
					{type} = event,
					actions = register[type]
				;

				if (actions) {
					actions.forEach((action) => action.call({context, event}));
				}
			},
			refs = {
				context,
				register,
				onAction
			}
		;

		__actionsRefsMap.set(this, refs);
	}

	add(type, actions) {
		if (!actions) {
			throw new Error('Missing action(s) to add.');
		}

		const refs = __actionsRefsMap.get(this);

		if (!refs.register[type]) {
			refs.register[type] = [];
			refs.context.on(type, refs.onAction);
		}

		refs.register[type] = refs.register[type].concat(actions);
	}

	remove(type, actions) {

	}

	has(type, action) {

	}
}

class Values {

	constructor() {
		const
			register = {},
			refs = {
				context,
				register
			}
		;

		__valuesMap.set(this, refs);
	}

	add(key, value) {

	}

	remove(key) {

	}

	has(key) {

	}

	get(key) {

	}

}

class Context extends EventEmitter {

	constructor() {
		super();
		this.__actions = new Actions(this);
		this.__values = new Values();
	}

	get actions() {
		return this.__actions;
	}

	get values() {
		return this.__values;
	}

}
