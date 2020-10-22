import {EventEmitter} from './EventEmitter';


// @TODO: Document
/**
 * The view.
 *
 * @public
 * @type {View}
 */
export class View extends EventEmitter {

	constructor(options) {
		super();
		this.options = options;
		this.context = options.context;
		this.el = options.el;
	}

	render() {
		return this;
	}

	destroy() {
		this.options = null;
		this.context = null;
		this.el = null;
		return this;
	}

}
