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


export class Initialize {

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

		let result, elements;

		result = this.beforeAll();
		if (__isFalse(result)) {
			return;
		}

		elements = root.querySelectorAll(settings.selector);
		if (elements.length === 0) {
			return;
		}

		elements.forEach((el, index) => {
			if (views.some((view) => view.el == el)) {
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
