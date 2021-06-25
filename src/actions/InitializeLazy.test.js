import ActionDefault from './__fixtures__/Action.default';
import {Action as ActionNamed} from './__fixtures__/Action.named';
import {Context} from '../Context';
import {InitializeLazy} from './InitializeLazy';


const flushPromises = () => new Promise(setImmediate);

describe('The lazy initialize action', () => {

	const
		SETTINGS = {
			selector: '.module'
		},
		PATH_NAMED_MODULE = './__fixtures__/Action.named',
		PATH_DEFAULT_MODULE = './__fixtures__/Action.default',
		PATH_INCORRECT_MODULE = './__fixtures__/Action.incorrect',
		PATH_NOT_AN_ACTION = './__fixtures__/FakeAction',
		EVENT_NAME = 'start:event',
		MockIO = jest.fn().mockImplementation((cb, options = {}) => {
			const instance = {
				root: options.root,
				rootMargin: options.rootMargin || '0px 0px 0px 0px',
				threshold:options.threshold || [],
				observe: jest.fn(),
				disconnect: jest.fn()
			};
			observers.push(instance);
			return instance;
		})
	;

	let context, observers;


	function setup(settings = SETTINGS, path = PATH_NAMED_MODULE, addToContext = true) {
		class Action extends InitializeLazy {
			get settings() {
				return settings;
			}

			get import() {
				return import(path);
			}
		}

		if (addToContext) {
			context.actions.add(EVENT_NAME, Action);
		}

		return Action;
	}

	function execute(callback = null, data = null) {
		if (callback) {
			context.on(EVENT_NAME + ':done', callback);
		}
		context.trigger(EVENT_NAME, data);
	}

	function intersect(entries = [{isIntersecting: true}]) {
		const callback = MockIO.mock.calls[0][0];
		callback(entries);
	}


	beforeEach(() => {
		observers = [];
		MockIO.mockClear();
		window.IntersectionObserver = MockIO;

		context = new Context();
		document.body.innerHTML = `
			<div class="module"></div>
			<div class="wrapper">
				<div class="module"></div>
			</div>
		`;
	});

	afterEach(() => {
		window.IntersectionObserver = undefined;
		delete(window.IntersectionObserver);

		context = null;
		document.body.innerHTML = '';
	});

	test('should have null as default settings', () => {
		const action = new InitializeLazy();
		expect(action.settings).toBe(null);
	});

	test('should have null as default import', () => {
		const action = new InitializeLazy();
		expect(action.import).toBe(null);
	});

	test('should have default settings for observer', () => {
		const action = new InitializeLazy();
		expect(action.observerSettings).toEqual({
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		});
	});

	test('should fail when null settings are defined', () => {
		setup(null);
		expect(execute).toThrow(new Error('Define settings object'));
	});

	test('should fail when settings is not an object', () => {
		setup('insert settings here');
		expect(execute).toThrow(new Error('Define settings object'));
	});

	test('should fail when no selector is defined in settings', () => {
		setup({});
		expect(execute).toThrow(new Error('Define a selector'));
	});

	test('should observe elements with intersection observer', async () => {
		const elements = document.querySelectorAll('.module');
		setup();
		execute();
		await flushPromises();

		// Creates observers?
		expect(MockIO).toHaveBeenCalledTimes(1);
		expect(MockIO.mock.calls[0]).toHaveLength(2);
		expect(MockIO.mock.calls[0][0]).toBeInstanceOf(Function);
		expect(MockIO.mock.calls[0][1]).toEqual({
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		});

		// Is observed?
		expect(observers[0].observe).toHaveBeenCalledTimes(2);
		expect(observers[0].observe.mock.calls[0]).toEqual([elements[0]]);
		expect(observers[0].observe.mock.calls[1]).toEqual([elements[1]]);
	});

	test('should observe elements with intersection observer depending on root', async () => {
		const
			elements = document.querySelectorAll('.wrapper .module'),
			root = document.querySelectorAll('.wrapper')[0]
		;
		setup();
		execute(null, {root});
		await flushPromises();

		expect(MockIO).toHaveBeenCalledTimes(1);
		expect(observers[0].observe).toHaveBeenCalledTimes(1);
		expect(observers[0].observe).toHaveBeenCalledWith(elements[0]);
	});

	test('should observe elements with intersection observer only when document is loaded', async () => {
		const
			event = document.createEvent('Event'),
			elements = document.querySelectorAll('.module')
		;

		document.readyState = 'loading';
		setup();
		execute();
		await flushPromises();

		expect(MockIO).toHaveBeenCalledTimes(0);

		document.readyState = 'complete';
		event.initEvent('DOMContentLoaded', false, false);
		window.dispatchEvent(event);
		await flushPromises();

		// Creates observers?
		expect(MockIO).toHaveBeenCalledTimes(1);
		expect(MockIO.mock.calls[0]).toHaveLength(2);
		expect(MockIO.mock.calls[0][0]).toBeInstanceOf(Function);
		expect(MockIO.mock.calls[0][1]).toEqual({
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		});

		// Is observed?
		expect(observers[0].observe).toHaveBeenCalledTimes(2);
		expect(observers[0].observe.mock.calls[0]).toEqual([elements[0]]);
		expect(observers[0].observe.mock.calls[1]).toEqual([elements[1]]);
	});

	test('should skip when not find any elements to observe', async () => {
		setup({selector: '.foo'});
		execute();
		await flushPromises();

		expect(MockIO).not.toHaveBeenCalled();
	});

	test('should not import and execute action when no element is intersecting', async () => {
		setup();
		execute();
		await flushPromises();

		expect(context.values.has('module')).not.toBeTruthy();

		intersect([
			{isIntersecting: false},
			{isIntersecting: false},
			{isIntersecting: false}
		]);
		expect(context.values.has('module')).not.toBeTruthy();
	});

	test('should import and execute named module action when at least one element is intersecting', async () => {
		setup();
		execute();
		await flushPromises();

		intersect([
			{isIntersecting: false},
			{isIntersecting: true},
			{isIntersecting: false}
		]);

		await flushPromises();
		expect(context.values.get('module')).toHaveLength(1);
		expect(context.values.get('module')[0]).toBeInstanceOf(ActionNamed);
	});

	test('should import and execute default module action when at least one element is intersecting', async () => {
		setup(SETTINGS, PATH_DEFAULT_MODULE);
		execute();
		await flushPromises();

		intersect([
			{isIntersecting: false},
			{isIntersecting: false},
			{isIntersecting: true}
		]);

		await flushPromises();
		expect(context.values.get('module')).toHaveLength(1);
		expect(context.values.get('module')[0]).toBeInstanceOf(ActionDefault);
	});

	test('should log error when import action with incorrect module export', async () => {
		const callback = jest.fn();
		context.on(EVENT_NAME + ':error', callback);

		setup(SETTINGS, PATH_INCORRECT_MODULE);
		execute();
		await flushPromises();

		intersect();
		await flushPromises();

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(expect.objectContaining({
			data: {
				error: new Error('Module must export Action or default'),
			},
		}));
	});

	test('should fail when import class with no run() method', async () => {
		const callback = jest.fn();
		context.on(EVENT_NAME + ':error', callback);

		setup(SETTINGS, PATH_NOT_AN_ACTION);
		execute();
		await flushPromises();

		intersect();
		await flushPromises();

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(expect.objectContaining({
			data: {
				error: new Error('Module must be an Action'),
			},
		}));
	});

	test('should import replace action in context with imported action', async () => {
		const Action = setup();
		expect(context.actions.get(EVENT_NAME)).toHaveLength(1);
		expect(context.actions.get(EVENT_NAME)[0]).toBe(Action);

		execute();
		await flushPromises();

		intersect();
		await flushPromises();

		expect(context.actions.get(EVENT_NAME)).toHaveLength(1);
		expect(context.actions.get(EVENT_NAME)[0]).toBe(ActionNamed);
	});

	test('should disconnect observers until first intersect', async () => {
		setup();
		execute();
		await flushPromises();

		intersect();
		await flushPromises();

		expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
		expect(observers[0].disconnect).toHaveBeenCalledWith();
	});

	test('should import module immediately when intersection observer is not supported', async () => {
		window.IntersectionObserver = undefined;
		delete(window.IntersectionObserver);

		setup();
		execute();
		await flushPromises();

		expect(MockIO).toHaveBeenCalledTimes(0);
	});

	test('should use custom condition', async () => {
		const Action = setup(SETTINGS, PATH_NAMED_MODULE, false);
		let resolveCallback;
		class CustomConditionAction extends Action {
			get condition() {
				return new Promise((resolve) => {
					resolveCallback = resolve;
				});
			}
		}

		context.actions.add(EVENT_NAME, CustomConditionAction);
		execute();
		await flushPromises();

		// Not called yet?
		expect(MockIO).not.toHaveBeenCalled();

		// Called now?
		resolveCallback();
		await flushPromises();
		expect(MockIO).toHaveBeenCalledTimes(1);
	});

	test('should handle a rejected condition', async () => {
		const consoleError = global.console.error;
		global.console.error = jest.fn();

		const callback = jest.fn();
		context.on(EVENT_NAME + ':error', callback);

		const Action = setup(SETTINGS, PATH_NAMED_MODULE, false);
		class CustomConditionAction extends Action {
			get condition() {
				return Promise.reject(new Error('This is rejected'));
			}
		}

		context.actions.add(EVENT_NAME, CustomConditionAction);
		execute();
		await flushPromises();

		expect(MockIO).not.toHaveBeenCalled();

		expect(global.console.error).toHaveBeenCalledTimes(1);
		expect(global.console.error).toHaveBeenCalledWith('[InitializeLazy] This is rejected');

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(expect.objectContaining({
			data: {
				error: new Error('This is rejected'),
			},
		}));

		global.console.error = consoleError;
	});

	test('should thrown an error when condition is not a promise', async () => {
		const Action = setup(SETTINGS, PATH_NAMED_MODULE, false);
		class CustomConditionAction extends Action {
			get condition() {
				return true;
			}
		}

		context.actions.add(EVENT_NAME, CustomConditionAction);
		expect(execute).toThrow(new Error('A conditon must be an instance of promise.'));
	});

});
