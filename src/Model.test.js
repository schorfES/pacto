import {EventEmitter} from './EventEmitter';
import {Model} from './Model';


describe('The model', () => {

	let model;

	beforeEach(() => {
		model = new Model();
	});

	afterEach(() => {
		model = null;
	});

	test('inherits EventEmitter', () => {
		expect(model).toBeInstanceOf(EventEmitter);
	});

	test('initializes with empty properties', () => {
		expect(model.props).toEqual({});
	});

	test('intialized with passed properties', () => {
		const
			props = {foo: 'foo', bar: ['baz', 1]},
			model = new Model(props)
		;

		expect(model.props).toEqual(props);
		expect(model.props).not.toBe(props);
	});

	test('initializes with defaults', () => {
		class TestModel extends Model {
			get defaults() {
				return {foo: 'bar', baz: 'baz'};
			}
		}

		const
			props = {foo: 'foo', bar: 'bar'},
			model = new TestModel(props)
		;

		expect(model.props).toEqual({foo: 'foo', bar: 'bar', baz: 'baz'});
	});

	test('triggers "change" event when prop added', () => {
		const
			sender = model,
			type = 'change',
			helper = {callback: () => {}},
			spy = jest.spyOn(helper, 'callback')
		;

		model.on(type, helper.callback);
		model.props.foo = 'bar';

		expect(spy).toHaveBeenCalledWith({sender, type, data: {
			prop: 'foo',
			value: 'bar'
		}});
	});

	test('triggers "change" event when prop changes', () => {
		const
			sender = model,
			type = 'change',
			helper = {callback: () => {}},
			spy = jest.spyOn(helper, 'callback')
		;

		model.props.foo = 'bar';
		model.on(type, helper.callback);
		model.props.foo = 'baz';

		expect(spy).toHaveBeenCalledWith({sender, type, data: {
			prop: 'foo',
			value: 'baz'
		}});
	});

	test('not triggers "change" event when prop not changes', () => {
		const
			type = 'change',
			helper = {callback: () => {}},
			spy = jest.spyOn(helper, 'callback')
		;

		model.props.foo = 'bar';
		model.on(type, helper.callback);
		model.props.foo = 'bar';

		expect(spy).not.toHaveBeenCalled();
	});

});
