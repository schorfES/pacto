import {Context} from './Context';
import {EventEmitter} from './EventEmitter';


describe('The context', () => {

	test('inherits EventEmitter', () => {
		expect(new Context() instanceof EventEmitter).toBeTruthy();
	});

});
