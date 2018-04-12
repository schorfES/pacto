import {Context} from './Context';
import {EventEmitter} from './EventEmitter';
import {View} from './View';


describe('The view', () => {

	let context;

	beforeEach(() => {
		context = new Context();
	});

	afterEach(() => {
		context = null;
	});

	test('should be instance of EventEmitter', () => {
		const view = new View({el: document.body, context});
		expect(view).toBeInstanceOf(EventEmitter);
	});

	test('should store reference to DOM element, context and options', () => {
		const
			el = document.body,
			params = {numbers: [1, 2, 3, 42], data: {foo: 'bar'}},
			options = {el, context, ...params},
			view = new View(options)
		;

		expect(view).toEqual({el, context, options});
	});

	test('should return instance on render() call', () => {
		const view = new View({el: document.body, context});
		expect(view.render()).toBe(view);
	});

	test('should remove references to DOM element, context and options on destroy()', () => {
		const view = new View({el: document.body, context});
		view.destroy();
		expect(view).toEqual({el: null, context: null, options: null});
	});

});
