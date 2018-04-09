import * as pacto from './index';


describe('The entry', () => {

	test('exports all components', () => {
		expect(Object.keys(pacto)).toEqual([
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
