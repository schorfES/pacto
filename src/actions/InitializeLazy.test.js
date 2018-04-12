import ActionDefault from './__fixtures__/Action.default';
import {Action as ActionNamed} from './__fixtures__/Action.named';
import {Context} from '../Context';
import {InitializeLazy} from './InitializeLazy';


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


	function setup(settings = SETTINGS, path = PATH_NAMED_MODULE) {
		class Action extends InitializeLazy {
			get settings() {
				return settings;
			}

			get import() {
				return import(path);
			}
		}

		context.actions.add(EVENT_NAME, Action);
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

	test('should observe elements with intersection observer', () => {
		const elements = document.querySelectorAll('.module');
		setup();
		execute();

		// Creates observers?
		expect(MockIO).toHaveBeenCalledTimes(2);
		expect(MockIO.mock.calls[0]).toHaveLength(2);
		expect(MockIO.mock.calls[0][0]).toBeInstanceOf(Function);
		expect(MockIO.mock.calls[0][1]).toEqual({
			rootMargin: '0px',
			threshold: [0, 0.5, 1]
		});

		// Is observed?
		expect(observers[0].observe).toHaveBeenCalledTimes(1);
		expect(observers[0].observe).toHaveBeenCalledWith(elements[0]);
		expect(observers[1].observe).toHaveBeenCalledWith(elements[1]);
	});

	test('should observe elements with intersection observer depending on root', () => {
		const
			elements = document.querySelectorAll('.wrapper .module'),
			root = document.querySelectorAll('.wrapper')[0]
		;
		setup();
		execute(null, {root});

		expect(MockIO).toHaveBeenCalledTimes(1);
		expect(observers[0].observe).toHaveBeenCalledTimes(1);
		expect(observers[0].observe).toHaveBeenCalledWith(elements[0]);
	});

	test('should not import and execute action when no element is intersecting', () => {
		setup();
		execute();
		expect(context.values.has('module')).not.toBeTruthy();
		intersect([
			{isIntersecting: false},
			{isIntersecting: false},
			{isIntersecting: false}
		]);
		expect(context.values.has('module')).not.toBeTruthy();
	});

	test('should import and execute named module action when at least one element is intersecting', (done) => {
		setup();
		execute(() => {
			expect(context.values.get('module')).toHaveLength(1);
			expect(context.values.get('module')[0]).toBeInstanceOf(ActionNamed);
			done();
		});
		intersect([
			{isIntersecting: false},
			{isIntersecting: true},
			{isIntersecting: false}
		]);
	});

	test('should import and execute default module action when at least one element is intersecting', (done) => {
		setup(SETTINGS, PATH_DEFAULT_MODULE);
		execute(() => {
			expect(context.values.get('module')).toHaveLength(1);
			expect(context.values.get('module')[0]).toBeInstanceOf(ActionDefault);
			done();
		});
		intersect([
			{isIntersecting: false},
			{isIntersecting: false},
			{isIntersecting: true}
		]);
	});

	test.skip('should fail when import action with incorrect module export', (done) => {
		// @TODO: This doesn't work
		process.once('unhandledRejection', error => {
			expect(error).toEqual(new Error('Module must export Action or default'));
			done();
		});
		setup(SETTINGS, PATH_INCORRECT_MODULE);
		execute();
		intersect();
	});

	test.skip('should fail when import class with no run() method', (done) => {
		// @TODO: This doesn't work
		process.once('unhandledRejection', error => {
			expect(error).toEqual(new Error('Module must be an Action'));
			done();
		});
		setup(SETTINGS, PATH_NOT_AN_ACTION);
		execute();
		intersect();
	});

	test('should import replace action in context with imported action', (done) => {
		const Action = setup();
		expect(context.actions.get(EVENT_NAME)).toHaveLength(1);
		expect(context.actions.get(EVENT_NAME)[0]).toBe(Action);

		execute(() => {
			expect(context.actions.get(EVENT_NAME)).toHaveLength(1);
			expect(context.actions.get(EVENT_NAME)[0]).toBe(ActionNamed);
			done();
		});
		intersect();
	});

	test('should disconnect observers until first intersect', (done) => {
		setup();
		execute(() => {
			expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
			expect(observers[0].disconnect).toHaveBeenCalledWith();
			expect(observers[1].disconnect).toHaveBeenCalledWith();
			done();
		});
		intersect();
	});

	test.skip('should not import module twice', () => {
		// @TODO: How to test if "import" is called twice?
	});

	test('should import module immediately when intersection observer is not supported', (done) => {
		window.IntersectionObserver = undefined;
		delete(window.IntersectionObserver);

		setup();
		execute(() => {
			expect(MockIO).toHaveBeenCalledTimes(0);
			done();
		});
	});

});
