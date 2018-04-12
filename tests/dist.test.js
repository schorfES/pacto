import * as pactoESM from '../dist/pacto.esm';
import * as pactoMIN from '../dist/pacto.min';
import * as pactoUMD from '../dist/pacto.umd';


const PACTO_CLASS_NAMES = [
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
		expect(Object.keys(pactoESM)).toEqual(PACTO_CLASS_NAMES);
	});

	test('umd build exposes all pacto classes', () => {
		expect(Object.keys(pactoUMD)).toEqual(PACTO_CLASS_NAMES);
	});

	test('min build exposes all pacto classes', () => {
		expect(Object.keys(pactoMIN)).toEqual(PACTO_CLASS_NAMES);
	});

});
