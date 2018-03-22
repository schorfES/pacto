import * as pacto from './index';


describe('The entry', () => {

	test('exports all components', () => {
		const expected = ['Collection', 'Context', 'EventEmitter', 'Model'];
		expect(Object.keys(pacto)).toEqual(expected);
	});

});
