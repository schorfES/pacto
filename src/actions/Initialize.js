function __isFalse(value) {
	return typeof value === 'boolean' && !value;
}

function __getSettings(instance) {
	const settings = instance.settings;

	if (!settings || typeof settings !== 'object') {
		throw new Error('Define settings object');
	}

	if (!settings.viewclass) {
		throw new Error('Define a view class');
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
		return {};
	}

	run() {
		this.beforeAll();

		const
			settings = __getSettings(this),
			{context, event} = this,
			{data} = event,
			views = context.values.get(settings.namespace) || [],
			root = data && data.root ? root : document.body
		;

		[...root.querySelectorAll(settings.selector)].forEach((el, index) => {
			const options = {el, context, ...settings.viewoptions};
			let
				result = null,
				view = null
			;

			result = this.beforeEach(options, el, index);
			if (__isFalse(result)) {
				return;
			}

			view = new settings.viewclass(options).render();

			result = this.afterEach(view, el, index);
			if (__isFalse(result)) {
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