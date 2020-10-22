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


/**
 * A basic initialize action to execute a module that is related to a single or
 * multiple DOM elements. Once a matching element is found, this action creates
 * an instance of the pre-configured view and passes the reference into the view.
 * The view gets rendered by this action using the <code>render()</code> method.
 *
 * Extend from this class to create an initialize action.
 *
 * @public
 * @type {InitializeLazy}
 */
export class Initialize {

	/**
	 * Implement this abstract getter to setup the instance of this action. The
	 * getter needs to return an object with the properties <code>selector</code>,
	 * <code>namespace</code> and <code>view</code>.
	 *
	 * The <code>selector</code> needs to be a valid a valid document query
	 * selector string. The Property <code>namespace</code> defines the key
	 * thats used to store the created views in the <code>.values</code> instance
	 * of the context. That allows to receive all references of the created views.
	 * <code>view</code> defines the view class that should be used.
	 *
	 * @abstract
	 * @return {Object} the settings object
	 */
	get settings() {
		return null;
	}

	/**
	 * Executes the action. This run function is not ment to be executed directly.
	 * An instance of this action will be created by pacto and this function will
	 * be called to execute this action.
	 *
	 * @private
	 * @throws if the settings getter is not implemented
	 * @throws if the settings getter doesn't return a selector
	 * @throws if the settings getter doesn't return a namespace
	 * @throws if the settings getter doesn't return a view class
	 */
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

	/**
	 * A hook that is called before the first view will be created.
	 *
	 * @abstract
	 * @return {undefined|boolean} return <code>false</code> to stop further execution.
	 */
	beforeAll() {
		// Overwrite this...
	}

	/**
	 * A hook that is called before a new view will be created.
	 *
	 * @abstract
	 * @param {Object} options the options that will be passed into the view.
	 * @param {Element} el the DOM element the view will be attached to.
	 * @param {number} index the index of the current element in the list of
	 * 		matching elements.
	 * @return {undefined|boolean} return <code>false</code> to stop further
	 * 		execution for this element/view.
	 */
	beforeEach(/* options, el, index */) {
		// Overwrite this...
	}

	/**
	 * A hook that is called after a new view will be created.
	 *
	 * @abstract
	 * @param {Object} options the options that will be passed into the view.
	 * @param {Element} el the DOM element the view will be attached to.
	 * @param {number} index the index of the current element in the list of
	 * 		matching elements.
	 * @return {undefined|boolean} return <code>false</code> to stop further
	 * 		execution for this element/view, the previously created view will
	 * 		not be added into the values store of the context.
	 */
	afterEach(/* view, el, index */) {
		// Overwrite this...
	}

	/**
	 * A hook that is called after all views where created.
	 *
	 * @abstract
	 * @param {Array} views the list of created views
	 */
	afterAll(/* views */) {
		// Overwrite this...
	}

}
