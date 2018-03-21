import {Model} from './Model';
import {EventEmitter} from './EventEmitter';


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

});
