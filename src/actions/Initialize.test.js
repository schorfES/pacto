import {Context} from '../Context';
import {View} from '../View';
import {Initialize} from './Initialize';


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

	test.skip('should create views in namespace', () => {
		// @TODO: Implement test case
	});

	test.skip('should create views with correct DOM elements', () => {
		// @TODO: Implement test case
	});

	test.skip('should not create views twice when calling twice', () => {
		// @TODO: Implement test case
	});

	test.skip('should create empty namespace when there are no DOM elements', () => {
		// @TODO: Implement test case
	});

	test.skip('should create views by given root-element in eventData', () => {
		// @TODO: Implement test case
	});

	test.skip('should pass params into view instances', () => {
		// @TODO: Implement test case
	});

	test.skip('should call beforeEach() on instance for each view', () => {
		// @TODO: Implement test case
	});

	test.skip('should not render views when beforeEach() returns "false"', () => {
		// @TODO: Implement test case
	});

	test.skip('should call afterEach() on instance for each view', () => {
		// @TODO: Implement test case
	});

	test.skip('should render views but not add them to namespace when afterEach() returns "false"', () => {
		// @TODO: Implement test case
	});

	test.skip('should call preExecute() when runs', () => {
		// @TODO: Implement test case
	});

	test.skip('should call postExecute() when runs', () => {
		// @TODO: Implement test case
	});

});
