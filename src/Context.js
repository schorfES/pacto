class Actions {

	constructor(context) {
		this.__context = context;
		this.__actions = {};
		this.__onExecute = this.__onExecute.bind(this);
	}

	add(type, actions) {
		if (!actions) {
			throw new Error('Missing action(s) to add.');
		}

		if (!this.__actions[type]) {
			this.__actions[type] = [];
			this.__context.on(type, this.__onExecute);
		}

		this.__actions[type] = this.__actions[type].concat(actions);
	}

	remove(type, actions) {

	}

	has(type, action) {

	}

	__onExecute(event) {
		const
			{type} = event,
			actions = this.__actions[type]
		;

		if (actions) {
			actions.forEach((action) =>
				action(event, this.__context));
		}
	}

}

class Values {

	constructor() {
		this.__values = {};
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
