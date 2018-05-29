import * as esm from '../dist/pacto.esm';
import * as min from '../dist/pacto.min';
import * as umd from '../dist/pacto.umd';


const CLASSES = [
	'Collection',
	'Context',
	'EventEmitter',
	'Initialize',
	'InitializeLazy',
	'Model',
	'View'
];

describe('The dist builds', () => {

	test('ems build exposes all pacto classes', () => {
		expect(Object.keys(esm)).toEqual(CLASSES);
	});

	test('umd build exposes all pacto classes', () => {
		expect(Object.keys(umd)).toEqual(CLASSES);
	});

	test('min build exposes all pacto classes', () => {
		expect(Object.keys(min)).toEqual(CLASSES);
	});

});
