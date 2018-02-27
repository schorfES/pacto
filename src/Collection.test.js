import {Collection} from './Collection';
import {EventEmitter} from './EventEmitter';


describe('The collection', () => {

	test('inherits EventEmitter', () => {
		expect(new Collection() instanceof EventEmitter).toBeTruthy();
	});

});
