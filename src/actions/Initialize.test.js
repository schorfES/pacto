import {Context} from '../Context';
import {Initialize} from './Initialize';
import {View} from '../View';


describe('The initialize action', () => {

	const
		SETTINGS = {
			selector: '.module',
			namespace: 'module',
			view: View
		},
		EVENT_NAME = 'start:event'
	;

	let context;

	function setup(settings = SETTINGS) {

		class Action extends Initialize {
			get settings() {
				return settings;
			}
		}

		wire(Action);
	}

	function wire(Action) {
		context.actions.add(EVENT_NAME, Action);
	}

	function execute(data = null) {
		context.trigger(EVENT_NAME, data);
	}

	beforeEach(() => {
		context = new Context();
		document.body.innerHTML = `
			<div class="module"></div>
			<div class="wrapper">
				<div class="module"></div>
			</div>
		`;
	});

	afterEach(() => {
		context = null;
		document.body.innerHTML = '';
	});

	test('should have null as default settings', () => {
		const action = new Initialize();
		expect(action.settings).toBe(null);
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
		setup({namespace: 'module', view: View});
		expect(execute).toThrow(new Error('Define a selector'));
	});

	test('should fail when no namespace is defined in settings', () => {
		setup({selector: '.module', view: View});
		expect(execute).toThrow(new Error('Define a namespace'));
	});

	test('should fail when no view is defined in settings', () => {
		setup({selector: '.module', namespace: 'module'});
		expect(execute).toThrow(new Error('Define a view'));
	});

	test('should not fail when selector returns no elements', () => {
		setup({selector: '.module-not-defined', namespace: 'module', view: View});
		expect(() => execute()).not.toThrow();
		expect(context.values.has('module')).toBeFalsy();
	});

	test('should create views in namespace', () => {
		setup({selector: '.module', namespace: 'module', view: View});
		execute();
		expect(context.values.has('module')).toBeTruthy();
		expect(context.values.get('module')).toHaveLength(2);
		expect(context.values.get('module')[0]).toBeInstanceOf(View);
	});

	test('should create views with correct DOM elements', () => {
		const elements = document.querySelectorAll('.module');
		setup({selector: '.module', namespace: 'module', view: View});
		execute();
		expect(context.values.get('module')[0].el).toBe(elements[0]);
		expect(context.values.get('module')[1].el).toBe(elements[1]);
	});

	test('should not create views twice when calling twice', () => {
		setup({selector: '.module', namespace: 'module', view: View});
		execute();

		const views = context.values.get('module');
		execute();
		expect(context.values.get('module')).toBe(views);
		expect(context.values.get('module')).toHaveLength(2);
	});

	test('should not create empty namespace when there are no DOM elements', () => {
		setup({selector: '.component', namespace: 'component', view: View});
		execute();
		expect(context.values.has('component')).not.toBeTruthy();
	});

	test('should create views by given root-element in event data', () => {
		const
			root = document.querySelectorAll('.wrapper')[0],
			elements = document.querySelectorAll('.wrapper .module')
		;

		setup({selector: '.module', namespace: 'module', view: View});
		execute({root});
		expect(context.values.get('module')).toHaveLength(1);
		expect(context.values.get('module')[0].el).toBe(elements[0]);
	});

	test('should pass params into view instances', () => {
		const
			elements = document.querySelectorAll('.module'),
			selector = '.module',
			namespace = 'module',
			view = View,
			params = {numbers: [1, 2, 3, 42], data: {foo: 'bar'}}
		;

		setup({selector, namespace, view, params});
		execute();

		expect(context.values.get('module')[0].options)
			.toEqual({el: elements[0], context, ...params});
	});

	test('should call render() on each view instance', () => {
		const views = [];
		class TestView extends View {
			render() {
				views.push(this);
			}
		}

		setup({selector: '.module', namespace: 'module', view: TestView});
		execute();
		expect(views).toEqual(context.values.get('module'));
	});

	test('should call beforeAll() when runs', () => {
		let callCount = 0;

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			beforeAll() {
				callCount++;
			}
		}

		wire(Action);
		execute();
		expect(callCount).toBe(1);
	});

	test('should stop run() when beforeAll() when returns "false"', () => {
		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			beforeAll() {
				return false;
			}
		}

		wire(Action);
		execute();
		expect(context.values.has('module')).not.toBeTruthy();
	});

	test('should call afterAll() when runs', () => {
		let callCount = 0;

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			afterAll() {
				callCount++;
			}
		}

		wire(Action);
		execute();
		expect(callCount).toBe(1);
	});

	test('should pass all views into afterAll() when runs', () => {
		let views = null;

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			afterAll(v) {
				views = v;
			}
		}

		wire(Action);
		execute();
		expect(views).toBe(context.values.get('module'));
	});

	test('should call beforeEach() on instance for each possible view', () => {
		const
			elements = document.querySelectorAll('.module'),
			params = {numbers: [1, 2, 3, 42], data: {foo: 'bar'}},
			calls = []
		;

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View, params};
			}

			beforeEach(options, el, index) {
				calls.push({options, el, index});
			}
		}

		wire(Action);
		execute();
		expect(calls).toHaveLength(2);
		expect(calls).toEqual([{
			options: {el: elements[0], context, ...params},
			el: elements[0],
			index: 0
		}, {
			options: {el: elements[1], context, ...params},
			el: elements[1],
			index: 1
		}]);
	});

	test('should not render views when beforeEach() returns "false"', () => {
		const elements = document.querySelectorAll('.module');

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			beforeEach(options, el, index) {
				if (index === 0) {
					return false;
				}
			}
		}

		wire(Action);
		execute();
		expect(context.values.get('module')).toHaveLength(1);
		expect(context.values.get('module')[0].el).toBe(elements[1]);
	});

	test('should call afterEach() on instance for each view', () => {
		const
			elements = document.querySelectorAll('.module'),
			params = {numbers: [1, 2, 3, 42], data: {foo: 'bar'}},
			calls = []
		;

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View, params};
			}

			afterEach(view, el, index) {
				calls.push({view, el, index});
			}
		}

		wire(Action);
		execute();
		expect(calls).toHaveLength(2);
		expect(calls).toEqual([{
			view: {
				el: elements[0],
				options: {el: elements[0], context, ...params},
				context
			},
			el: elements[0],
			index: 0
		}, {
			view: {
				el: elements[1],
				options: {el: elements[1], context, ...params},
				context
			},
			el: elements[1],
			index: 1
		}]);
	});

	test('should render views but not add them to namespace when afterEach() returns "false"', () => {
		const elements = document.querySelectorAll('.module');

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			afterEach(options, el, index) {
				if (index === 0) {
					return false;
				}
			}
		}

		wire(Action);
		execute();
		expect(context.values.get('module')).toHaveLength(1);
		expect(context.values.get('module')[0].el).toBe(elements[1]);
	});

	test('should execute all function in expected order', () => {
		const calls = [];

		class Action extends Initialize {
			get settings() {
				return {selector: '.module', namespace: 'module', view: View};
			}

			beforeAll() {
				calls.push('beforeAll');
			}

			beforeEach() {
				calls.push('beforeEach');
			}

			afterEach() {
				calls.push('afterEach');
			}

			afterAll() {
				calls.push('afterAll');
			}
		}

		wire(Action);
		execute();
		expect(calls).toEqual([
			'beforeAll',
			'beforeEach',
			'afterEach',
			'beforeEach',
			'afterEach',
			'afterAll'
		]);
	});

});
