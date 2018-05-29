import * as lib from './index';


describe('The entry', () => {

	test('exports all components', () => {
		expect(Object.keys(lib)).toEqual([
			'Collection',
			'Context',
			'EventEmitter',
			'Initialize',
			'InitializeLazy',
			'Model',
			'View'
		]);
	});

});
