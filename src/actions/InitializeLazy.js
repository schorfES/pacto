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


/**
 * A basic lazy initialize action. Extend from this class to create a lazy
 * initialize action for a module that should initialize once a DOM element is
 * visible for the user. This implementation uses an intersection observer to
 * detect the visibility of of an element.
 *
 * @public
 * @type {InitializeLazy}
 */
export class InitializeLazy {

	/**
	 * Constructor. Do not call this directly. An instance of an action will be
	 * created by pacto.
	 *
	 * @private
	 */
	constructor() {
		this._onIntersect = this._onIntersect.bind(this);
	}

	/**
	 * Implement this abstract getter to setup the instance of this action. The
	 * getter needs to return an object with the property <code>selector</code>.
	 *
	 * The <code>selector</code> needs to be a valid a valid document query
	 * selector string.
	 *
	 * @abstract
	 * @return {Object} the settings object
	 */
	get settings() {
		return null;
	}

	/**
	 * Implement this abstract getter to return a dynamic import. Reference the
	 * initialize action of the same module here. This allows to create chunks
	 * during a build process and separates the main bundle from the module chunk.
	 *
	 * @abstract
	 * @return {Promise} the promise of an import() call
	 */
	get import() {
		return null;
	}

	/**
	 * Implement a condition that controls the execution by resolving the returned
	 * promise. By default, this condition is based on the document.readyState
	 * and/or the DOMContentLoaded event.
	 *
	 * @return {Promise} the promise to be resolved when the condition applies
	 */
	get condition() {
		if (document.readyState === 'complete') {
			return Promise.resolve();
		}

		return new Promise((resolve) =>
			window.addEventListener('DOMContentLoaded', resolve, {once: true}));
	}

	/**
	 * Returns the settings/options/properties for the intersection observer that
	 * is used to detect the visibility of the relevant DOM elements for this
	 * module. Default values are:
	 * <pre>
	 * {
	 *   rootMargin: '0px',
	 *   threshold: [0, 0.5, 1]
	 * }
	 * </pre>
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver#Properties
	 * @return {Object} the observer settings
	 */
	get observerSettings() {
		return {
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		};
	}

	/**
	 * Executes the action. This run function is not ment to be executed directly.
	 * An instance of this action will be created by pacto and this function will
	 * be called to execute this action.
	 *
	 * @private
	 * @throws if the settings getter is not implemented
	 * @throws if the settings getter doesn't return a selector
	 * @throws if the import getter is not implemented
	 */
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
