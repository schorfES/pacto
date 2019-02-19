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

	get observerSettings() {
		return {
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		};
	}

	run() {
		const settings = __getSettings(this);
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
		.catch((error) => {
			this.context.trigger(this.event.type + ':error', {error}); // Only for testing reasons
			throw error;
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
