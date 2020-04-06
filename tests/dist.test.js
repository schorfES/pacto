import * as cjs from '../dist/pacto.cjs';
import * as esm from '../dist/pacto.esm';


const CLASSES = [
	'Context',
	'EventEmitter',
	'Initialize',
	'InitializeLazy',
	'View'
];

describe('The dist builds', () => {

	test('ems build exposes all pacto classes', () => {
		expect(Object.keys(esm)).toEqual(CLASSES);
	});

	test('cjs build exposes all pacto classes', () => {
		expect(Object.keys(cjs)).toEqual(CLASSES);
	});

});
