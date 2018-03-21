import {Collection} from './Collection';
import {EventEmitter} from './EventEmitter';


describe('The collection', () => {

	let collection;

	beforeEach(() => {
		collection = new Collection();
	});

	afterEach(() => {
		collection = null;
	});

	test('inherits EventEmitter', () => {
		expect(collection).toBeInstanceOf(EventEmitter);
	});

});
