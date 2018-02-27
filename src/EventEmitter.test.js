import {EventEmitter} from './EventEmitter';


describe('The eventemitter', () => {

	let eventemitter = null;

	beforeEach(() => {
		eventemitter = new EventEmitter();
	});

	afterEach(() => {
		eventemitter = null;
	});

	test('add events by type and callback', () => {
		eventemitter.on('foo', () => {});
		expect(eventemitter).toBeTruthy();
	});

});
