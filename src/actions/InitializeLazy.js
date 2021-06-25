function __getSettings(instance) {
	const settings = instance.settings;

	if (!settings || typeof settings !== 'object') {
		throw new Error('Define settings object');
	}

	if (!settings.selector) {
		throw new Error('Define a selector');
	}

	return settings;
}

function __error(action, error) {
	window.console &&
	window.console.error &&
	window.console.error('[InitializeLazy] ' + error.message);

	action.context.trigger(action.event.type + ':error', {error});
}


export class InitializeLazy {

	constructor() {
		this._onIntersect = this._onIntersect.bind(this);
	}

	get settings() {
		return null;
	}

	get import() {
		return null;
	}

	get condition() {
		if (document.readyState === 'complete') {
			return Promise.resolve();
		}

		return new Promise((resolve) =>
			window.addEventListener('DOMContentLoaded', resolve, {once: true}));
	}

	get observerSettings() {
		return {
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		};
	}

	run() {
		const {selector} = __getSettings(this);
		const { condition } = this;

		if (!(condition instanceof Promise)) {
			throw new Error('A conditon must be an instance of promise.')
		}

		condition
			.then(() => this._lookup(selector))
			.catch((error) => __error(this, error));
	}

	_lookup(selector) {
		const {event} = this;
		const {data} = event;
		const root = data && data.root ? data.root : document.body;
		const elements = root.querySelectorAll(selector);

		if (elements.length === 0) {
			return;
		}

		this._setup(elements);
	}

	_setup(elements) {
		if (window.IntersectionObserver) {
			this._observe(elements);
		} else {
			this._fetch();
		}
	}

	_observe(elements) {
		this._observer = new window.IntersectionObserver(this._onIntersect, this.observerSettings);
		elements.forEach((element) => this._observer.observe(element));
	}

	_disconnect() {
		this._observer.disconnect();
		this._observer = null;
	}

	_fetch() {
		const {event} = this;

		this.import.then((module) => {
			const Action = module.Action || module.default;

			if (!Action) {
				throw new Error('Module must export Action or default');
			}

			if (!(typeof Action.prototype.run === 'function')) {
				throw new Error('Module must be an Action');
			}

			// Replace the proxy action with the loaded action
			this.context.actions
				.add(event.type, Action)
				.remove(event.type, this.constructor);

			// Execute the current action:
			this._execute(Action);
		})
		.catch((error) => __error(this, error));
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
