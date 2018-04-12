export class InitializeLazy {

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
			root = data && data.root ? data.root : document.body,
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
