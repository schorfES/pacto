import {Model} from './Model';
import {EventEmitter} from './EventEmitter';


describe('The model', () => {

	test('inherits EventEmitter', () => {
		expect(new Model() instanceof EventEmitter).toBeTruthy();
	});

});
